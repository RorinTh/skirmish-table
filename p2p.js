// Skirmish Table - peer-to-peer online play.
// Stands in for the shared database and live room the claude.ai version of the page uses, so the game's own online
// code runs unchanged. The player who starts a game hosts it: their browser keeps the game and relays every change
// to the other players over WebRTC (PeerJS). The other players connect straight to the host with the game code.
// The host's tab has to stay open; if it closes, the others reconnect when the host opens the game again.
(() => {
	'use strict';
	if (typeof Peer !== 'function') return;          // PeerJS did not load: the page stays a one-screen game

	const PREFIX = 'sktable-v1-';                     // PeerJS id of a game's host: PREFIX + game code
	const HOSTED = 'sktable-hosted';                  // codes this browser hosts (newest last)
	const STORE = 'sktable-store-';                   // a hosted game's documents, kept so the host can reload
	const MAX_DOC = 600000, MAX_DOCS = 4000, MAX_ROLLS = 40;
	const CODE_RE = /^[a-z0-9]{4,12}$/;

	const store = new Map();                          // path -> document
	const listeners = new Set();
	let S = null;                                     // the current session
	let onStatus = () => { };

	const clone = v => JSON.parse(JSON.stringify(v));
	const parentOf = p => p.slice(0, p.lastIndexOf('/'));
	const rid = () => { const a = 'abcdefghijklmnopqrstuvwxyz0123456789', b = new Uint8Array(16); crypto.getRandomValues(b); return [...b].map(x => a[x % a.length]).join(''); };
	const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
	const lsSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } };
	const lsDel = k => { try { localStorage.removeItem(k); } catch { } };
	const hostedCodes = () => { try { const a = JSON.parse(lsGet(HOSTED) || '[]'); return Array.isArray(a) ? a.filter(c => CODE_RE.test(c)) : []; } catch { return []; } };
	const inGame = path => S && typeof path === 'string' && (path === 'games/' + S.code || path.startsWith('games/' + S.code + '/')) && path.length < 200;

	// ---- listeners: each keeps what it last delivered and is told only about what changed
	function snapDoc(L, own) {
		const has = store.has(L.path), j = has ? JSON.stringify(store.get(L.path)) : null;
		if (L.last !== undefined && L.last === j) return;
		L.last = j;
		const data = has ? clone(store.get(L.path)) : undefined;
		L.cb({ id: L.path.split('/').pop(), exists: has, data: () => data && clone(data), metadata: { hasPendingWrites: !!own?.has(L.path), fromCache: false } });
	}
	function snapCol(L, own) {
		let rows = [];
		for (const [p, d] of store) if (parentOf(p) === L.path) rows.push([p, d]);
		if (L.q.order) { const [f, dir] = L.q.order, k = dir === 'desc' ? -1 : 1; rows.sort((a, b) => ((a[1][f] ?? 0) > (b[1][f] ?? 0) ? 1 : (a[1][f] ?? 0) < (b[1][f] ?? 0) ? -1 : 0) * k); }
		if (L.q.limit) rows = rows.slice(0, L.q.limit);
		const now = new Map(rows.map(([p, d]) => [p, JSON.stringify(d)]));
		const first = !L.last, prev = L.last || new Map(), changes = [];
		const docOf = (p, j) => { const data = JSON.parse(j); return { id: p.split('/').pop(), data: () => clone(data), metadata: { hasPendingWrites: !!own?.has(p) } }; };
		for (const [p, j] of now) if (prev.get(p) !== j) changes.push({ type: prev.has(p) ? 'modified' : 'added', doc: docOf(p, j) });
		for (const [p, j] of prev) if (!now.has(p)) changes.push({ type: 'removed', doc: docOf(p, j) });
		L.last = now;
		if (!first && !changes.length) return;
		const docs = [...now].map(([p, j]) => docOf(p, j));
		L.cb({ docs, empty: !docs.length, size: docs.length, docChanges: () => changes, metadata: { hasPendingWrites: !!own && changes.some(c => own.has(L.path + '/' + c.doc.id)), fromCache: false } });
	}
	function fire(L, own) { try { L.kind === 'doc' ? snapDoc(L, own) : snapCol(L, own); } catch (e) { console.error(e); } }
	function notify(own) { if (S?.ready) for (const L of [...listeners]) fire(L, own); }
	function listen(L) {
		listeners.add(L);
		if (S?.ready) setTimeout(() => listeners.has(L) && fire(L), 0);
		return () => listeners.delete(L);
	}

	// ---- writes
	function hostApply(path, data) {
		if (data === null) { store.delete(path); return; }
		if (!store.has(path) && store.size >= MAX_DOCS) throw Object.assign(new Error('full'), { code: 'quota_exceeded' });
		store.set(path, data);
		if (path.includes('/rolls/')) {            // keep the dice history short
			const col = parentOf(path), rolls = [...store].filter(([p]) => parentOf(p) === col).sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0));
			for (const [p] of rolls.slice(MAX_ROLLS)) { store.delete(p); broadcast({ t: 'op', path: p, data: null, from: 'host' }); }
		}
	}
	function write(path, data) {
		if (!inGame(path)) return Promise.reject(Object.assign(new Error('not in a game'), { code: 'not_found' }));
		if (data !== null && JSON.stringify(data).length > MAX_DOC) return Promise.reject(Object.assign(new Error('too big'), { code: 'quota_exceeded' }));
		if (S.host) {
			try { hostApply(path, data); } catch (e) { return Promise.reject(e); }
			broadcast({ t: 'op', path, data, from: 'host' });
			persist();
		} else {
			if (data === null) store.delete(path); else store.set(path, data);
			S.pend.set(path, (S.pend.get(path) || 0) + 1);
			const op = { t: 'op', path, data };
			if (S.conn?.open) S.conn.send(op); else S.outbox.push(op);
		}
		notify(new Set([path]));
		return Promise.resolve();
	}
	let persistTimer = 0;
	function persist() {
		clearTimeout(persistTimer);
		const s = S;
		persistTimer = setTimeout(() => { if (s === S && S.host) lsSet(STORE + S.code, JSON.stringify([...store])); }, 400);
	}

	// ---- presence: who is here (seat, live moves, pings)
	function peerList() { return [...S.pres].map(([id, presence]) => ({ id, sameTab: id === S.me, presence: clone(presence || {}) })); }
	function firePeers() { if (!S) return; const peers = peerList(); for (const cb of [...S.peerCbs]) { try { cb({ peers }); } catch (e) { console.error(e); } } }
	function broadcast(msg) { if (!S?.host) return; for (const c of S.conns.values()) if (c.open) c.send(msg); }
	function sharePeers() { broadcast({ t: 'peers', list: [...S.pres] }); firePeers(); }

	// ---- host
	function startHost(s) {
		s.me = PREFIX + s.code;
		const peer = s.peer = new Peer(s.me);
		peer.on('open', () => { if (S !== s) return; s.retry = 0; onStatus('You host this game: keep this tab open while you play. Send the others the link.'); });
		peer.on('connection', conn => {
			if (S !== s) { conn.close(); return; }
			conn.on('open', () => {
				if (S !== s) return;
				s.conns.set(conn.peer, conn);
				s.pres.set(conn.peer, {});
				conn.send({ t: 'init', docs: [...store], peers: [...s.pres] });
				sharePeers();
			});
			conn.on('data', m => {
				if (S !== s || !m || typeof m !== 'object') return;
				if (m.t === 'op' && inGame(m.path) && (m.data === null || (typeof m.data === 'object' && JSON.stringify(m.data).length <= MAX_DOC))) {
					try { hostApply(m.path, m.data === null ? null : clone(m.data)); } catch { return; }
					broadcast({ t: 'op', path: m.path, data: m.data, from: conn.peer });
					persist(); notify();
				} else if (m.t === 'pres' && m.p && typeof m.p === 'object' && JSON.stringify(m.p).length < 8000) {
					s.pres.set(conn.peer, m.p); sharePeers();
				}
			});
			const gone = () => { if (S !== s) return; s.conns.delete(conn.peer); s.pres.delete(conn.peer); sharePeers(); };
			conn.on('close', gone); conn.on('error', gone);
		});
		peer.on('disconnected', () => { if (S === s && !peer.destroyed) setTimeout(() => S === s && !peer.destroyed && peer.reconnect(), 2000); });
		peer.on('error', e => {
			if (S !== s) return;
			if (e.type === 'unavailable-id') {
				onStatus('This game is already open in another tab or window, or the last connection is still closing. Trying again…');
				peer.destroy(); setTimeout(() => S === s && startHost(s), 4000);
			} else if (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error' || e.type === 'socket-closed') {
				onStatus('Can’t reach the connection service. Check your internet connection. Trying again…');
			}
		});
	}

	// ---- guest
	function startGuest(s) {
		const peer = s.peer = new Peer();
		peer.on('open', id => { if (S !== s) return; s.me = id; s.pres.set(id, s.myPres); connect(s); });
		peer.on('disconnected', () => { if (S === s && !peer.destroyed) setTimeout(() => S === s && !peer.destroyed && peer.reconnect(), 2000); });
		peer.on('error', e => {
			if (S !== s) return;
			if (e.type === 'peer-unavailable') { onStatus('Can’t reach the host. The player who started the game needs to have it open. Trying again…'); retry(s); }
			else if (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error' || e.type === 'socket-closed') onStatus('Can’t reach the connection service. Check your internet connection. Trying again…');
		});
	}
	function retry(s) { clearTimeout(s.retryTimer); s.retryTimer = setTimeout(() => { if (S === s && !s.conn?.open) connect(s); }, 4000); }
	function connect(s) {
		if (S !== s || s.peer.destroyed) return;
		if (!s.peer.open) { retry(s); return; }
		const conn = s.peer.connect(PREFIX + s.code, { reliable: true, serialization: 'json' });
		conn.on('open', () => {
			if (S !== s) { conn.close(); return; }
			s.conn = conn;
			conn.send({ t: 'pres', p: s.myPres });
		});
		conn.on('data', m => {
			if (S !== s || !m || typeof m !== 'object') return;
			if (m.t === 'init' && Array.isArray(m.docs)) {
				store.clear();
				for (const [p, d] of m.docs) if (inGame(p)) store.set(p, d);
				for (const op of s.outbox) { if (op.data === null) store.delete(op.path); else store.set(op.path, op.data); conn.send(op); }
				s.outbox = [];
				if (Array.isArray(m.peers)) s.pres = new Map(m.peers);
				s.pres.set(s.me, s.myPres);
				const first = !s.ready;
				s.ready = true;
				onStatus('');
				if (first) for (const L of [...listeners]) fire(L); else notify();
				firePeers();
			} else if (m.t === 'op' && inGame(m.path)) {
				const n = s.pend.get(m.path) || 0;
				if (m.from === s.me) {
					if (n > 1) { s.pend.set(m.path, n - 1); return; }
					s.pend.delete(m.path);
				} else if (n > 0) return;              // our own later write to it is still on its way and wins
				if (m.data === null) store.delete(m.path); else store.set(m.path, m.data);
				notify();
			} else if (m.t === 'peers' && Array.isArray(m.list)) {
				s.pres = new Map(m.list);
				s.pres.set(s.me, s.myPres);
				firePeers();
			}
		});
		const lost = () => {
			if (S !== s || s.conn !== conn) { if (S === s && !s.conn) retry(s); return; }
			s.conn = null; s.pend.clear();
			s.pres = new Map([[s.me, s.myPres]]); firePeers();
			onStatus('Lost the connection to the host. Reconnecting…');
			retry(s);
		};
		conn.on('close', lost); conn.on('error', lost);
		setTimeout(() => { if (S === s && !conn.open) { try { conn.close(); } catch { } if (!s.conn) retry(s); } }, 10000);
	}

	// ---- sessions
	function begin(code, create) {
		end();
		if (!CODE_RE.test(code)) return;
		let codes = hostedCodes();
		const host = create || codes.includes(code);
		store.clear();
		if (host) {
			if (create) lsDel(STORE + code);
			else { try { for (const [p, d] of JSON.parse(lsGet(STORE + code) || '[]')) store.set(p, d); } catch { } }
			codes = codes.filter(c => c !== code).concat(code);
			for (const old of codes.slice(0, -5)) lsDel(STORE + old);
			lsSet(HOSTED, JSON.stringify(codes.slice(-5)));
		}
		S = { code, host, ready: host, me: null, peer: null, conn: null, conns: new Map(), pres: new Map(), myPres: {}, peerCbs: new Set(), outbox: [], pend: new Map(), retryTimer: 0 };
		onStatus(host ? 'Starting the game…' : 'Connecting to the host…');
		if (host) { S.pres.set(PREFIX + code, S.myPres); startHost(S); } else startGuest(S);
	}
	function end() {
		if (!S) return;
		const s = S;
		if (s.host) lsSet(STORE + s.code, JSON.stringify([...store]));
		S = null;
		clearTimeout(s.retryTimer);
		try { s.conn?.close(); } catch { }
		for (const c of s.conns.values()) { try { c.close(); } catch { } }
		try { s.peer?.destroy(); } catch { }
		listeners.clear();
		store.clear();
	}
	window.addEventListener('beforeunload', () => { if (S?.host) lsSet(STORE + S.code, JSON.stringify([...store])); });

	// ---- the two namespaces the page asks for
	function docRef(path) {
		return {
			id: path.split('/').pop(), path,
			set: data => write(path, clone(data)),
			update: data => write(path, { ...(store.get(path) || {}), ...clone(data) }),
			delete: () => write(path, null),
			onSnapshot: (cb, err) => listen({ kind: 'doc', path, cb, err })
		};
	}
	function colRef(path, q = {}) {
		return {
			path,
			doc: id => docRef(path + '/' + (id || rid())),
			orderBy: (f, dir) => colRef(path, { ...q, order: [f, dir] }),
			limit: n => colRef(path, { ...q, limit: n }),
			onSnapshot: (cb, err) => listen({ kind: 'col', path, q, cb, err })
		};
	}
	const db = { doc: docRef, collection: p => colRef(p) };
	const room = {
		join: async () => {
			const s = S;
			if (!s) throw new Error('no game');
			return {
				presence: async patch => {
					if (S !== s || !patch || typeof patch !== 'object') return;
					Object.assign(s.myPres, clone(patch));
					if (s.host) sharePeers();
					else { if (s.conn?.open) s.conn.send({ t: 'pres', p: s.myPres }); firePeers(); }
				},
				onPeers: (cb) => { s.peerCbs.add(cb); setTimeout(() => S === s && s.peerCbs.has(cb) && cb({ peers: peerList() }), 0); return () => s.peerCbs.delete(cb); },
				leave: async () => { }
			};
		}
	};
	window.p2p = { begin, end, isHost: () => !!S?.host, set onStatus(f) { onStatus = typeof f === 'function' ? f : () => { }; } };
	window.claude = { use: async name => name === 'db' ? db : name === 'room' ? room : null };
})();
