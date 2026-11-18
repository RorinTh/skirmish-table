# Skirmish Table

A browser table for playing a tabletop miniatures skirmish game on one screen: a top-down board in inches, models on round bases, terrain, measuring, unit moves with coherency, dice, a score board, a chess clock and damage tracking.

**Play it:** https://rorinth.github.io/skirmish-table/

There is nothing to build or install: `index.html` is the game, and `p2p.js` adds online play. Your board is saved in your browser.

## Card library

No game cards ship with the page. If you have your own card library file (`skirmish-library.json`), load it under **Table & save** and the page matches units to their cards. Health, Shield and Coherency are then filled in from the card, and a unit's supply follows the card's models/supply table: as models are removed or destroyed, the unit counts the supply for the models it has left. The supply a unit loses is scored automatically as **Supply destroyed** for the other player in the current round (undo takes it back; − and + in the score table correct it). For units without a card, type Health and Shield once on the unit card and the page remembers them for that unit type.

## Mission Markers

With a deployment chosen, a model whose base is within 3″ of a Mission Marker contests it and shows the marker's number on its base. Each marker shows the supply each side has on it (every unit with a model there counts once). A side takes control when it has more supply on a marker than the other side, and the marker then glows in that player's colour. A tie or an empty marker keeps its control, and every marker starts with no one controlling it. Right-click a marker to set control by hand.

## Online play

Under **Online game**, choose **Start online game with this board** and send the other player the link (**Copy link**). They need no account.

- The player who starts the game hosts it. Their browser keeps the game and passes every change to the other players, so **the host keeps the tab open**. If the host reloads or comes back later in the same browser, the game continues where it was and the others reconnect on their own.
- The browsers connect directly to each other (WebRTC, through [PeerJS](https://peerjs.com/)). PeerJS's free public service only introduces them; the game itself doesn't go through it.
- Some strict networks (some company, school or mobile networks) block direct connections. Players behind one can't join.
- Anyone who has the link or the code can join and change the board.
- Spectators can watch too: they join and pick **Spectator**.

## Disclaimer

A fan-made tool, not affiliated with or endorsed by Blizzard Entertainment or any game publisher. The unit symbols on the bases are drawn for this page and contain no official art.
