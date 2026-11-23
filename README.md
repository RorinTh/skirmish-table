# Skirmish Table

A browser table for playing a tabletop miniatures skirmish game on one screen: a top-down board in inches, models on round bases, terrain, measuring, unit moves with coherency, dice, a score board, a chess clock and damage tracking.

**Play it:** https://rorinth.github.io/skirmish-table/

There is nothing to build or install: `index.html` is the game, and `p2p.js` adds online play. Your board is saved in your browser.

## A new game

A new game starts with two of the rulebook's 1000 Minerals example armies in the reserves: Raynor's Raiders for Player 1 and Kerrigan's Swarm for Player 2, with their Faction and Tactical cards, on the **Abandoned Camp** deployment with the **Frontlines** mission. With the card library loaded they get their bases, portraits and specialists; without it they wait on 32 mm bases. Import your own lists in Setup (tick *Remove this player's models first*), or **Load example** under Save & load to start over.

## Setup and Play

**Setup** (top left) walks through four steps: the table and deployment, both armies (import a list or pick an example army; a custom unit is folded away below), terrain, and **Play here** or **Play online**. **Play** keeps the units on the table, the unit cards and the rules on the left; the dice and the selected model stay on the right. The buttons on the board's edges (or the **[** and **]** keys) fold either side panel away to give the board room. **?** at the top lists every control and shortcut.

## Moving and placing

Hold **W** with a model (or a Mission Marker) selected for *Wholly Within* distances: **WHOLLY WITHIN** shows over it, and every distance runs to the far edge of the other bases instead of the near edge; for a unit, its farthest model is the one labelled.


A model's base may hang off the table or overlap another model, but it gets a red edge while it does and a message when it is put down. Hold **Ctrl** while dragging to keep it wholly on the table and against, not on, other bases (Ctrl+click still adds a model to the selection). The models that follow a unit's leader in coherency are always placed wholly on the table and clear of other bases.

## Rounds

**End round** (top) is the Scoring & Cleanup step: it decides who controls each Mission Marker, then starts the next round. Tactical cards are readied, activation tokens go, and so do the tokens that last until the End of the Round (Buff and Debuff tokens, Stimpack, Guardian Shield, Farsight, Optical Flare, Tactical Retreat and the like). Tokens that stay in play (Burrowed, Hidden, Siege Mode, Faction Indicators, Force Fields, templates) stay.

Right-click a model and choose **Activated in the Movement Phase** (an arrow) or **Activated in the Assault Phase** (a crosshair) to mark its unit; choose it again to take the token off. The same menu gives one model a glow of its own.

## Card library

No game cards ship with the page. If you have your own card library file (`skirmish-library.json`), load it under **Setup › Card library** and the page matches units to their cards. Health, Shield and Coherency are then filled in from the card, an upgrade that raises Health outright (Kinetic Foam) adds to it, and a unit's supply follows the card's models/supply table: as models are removed or destroyed, the unit counts the supply for the models it has left. The supply a unit loses is scored automatically as **Supply destroyed** for the other player in the current round (undo takes it back; − and + in the score table correct it). For units without a card, type Health and Shield once on the unit card and the page remembers them for that unit type.

Damage is marked on the unit: each point goes to the model already wounded, else the next one from the back of the unit (specialists last), and a model is destroyed when its Health runs out. Click a model in the Reserves to see its card.

## Missions

Under the deployment in Setup, pick a **Mission**: Supply Drop, Hold Position, Frontlines, Gather the Resources, Divide and Conquer, Artefact Hunt or Fire in the Sky, at Standard Engagement or Skirmish Level. The list and the mission text come from the Mission Cards in your own card library (none ship with the page). Point at either player's score at the top: the popover shows the mission's supply, game length, its parts with the scoring ones marked (and whether they score this round), and the lead that ends the game early, above the score by round. The mission is shared in an online game; each player needs the library to read its text.

With **Divide and Conquer**, dashed lines split the table into quarters through its centre. Each quarter shows the supply each side has Wholly Within it (a unit controlling a Mission Marker counts 1 more), framed in the colour of the side with more. Every unit on the table shows which quarter it is wholly in under its first model, or *no quarter* when it crosses a line and counts in none.

## Mission Markers

With a deployment chosen, a model whose base is within 3″ of a Mission Marker contests it and shows the marker's number on its base. Each marker shows the supply each side has on it (every unit with a model there counts once; a Commander, a Supply Depot or a Domineering Presence counts one more). Control is decided when a player presses **End round**: the side with more supply on a marker takes it, and the marker then glows in that player's colour. A tie or an empty marker keeps its control, and every marker starts with no one controlling it. Right-click a marker to set control by hand.

While a model is selected, each Mission Marker shows the distance from that model's base to the marker's edge. Click a marker to select it: every model then shows its distance to that marker's edge. Click anywhere else to let go of it.

## Tokens

Units can carry tokens: right-click a model and choose **Add token…**, or use **+ Token** on the selected model's card. The picker lists the tokens of the unit's faction first (Protoss, Terran, Zerg), then the ones any faction uses (Hidden, Stationary), and has a Buff/Debuff maker (stat and value). Tokens show at 25 mm above the unit's first model on the table. The picker shows the tokens the army on the table uses first (from its unit cards, upgrades, faction and tactical cards), with **Show all tokens** for the rest. For a unit it lists its own army's tokens that go on friendly units and the opponent's tokens that go on enemy units; tokens an ability puts on the unit that has it (Guardian Shield on a Sentry, Stimpack, Combat Shield, Siege Mode, Burrowed, Broodmother) are only offered for those units. When both players play the same faction, tokens take the colour of the player who put them down. Click a token on the card to take it off, or **Clear** to take them all off; Undo puts them back. The token symbols are drawn for this page.

### Tokens on the table

Right-click an empty spot of the table and choose **Place faction token here…** for a Faction Indicator (32 mm), a Force Field (80 mm), a Shade (40 mm) or a Creep Tumor (32 mm). Right-click an Adept and choose **Place Shade** for a see-through copy of it next to it. These pieces are not units: they count no supply and do not contest Mission Markers. Drag them anywhere; while one is selected, the distance to every model, Mission Marker and terrain piece shows.

## Tactical cards

Each player's Faction and Tactical cards sit in the board's right corners, Player 2 at the top and Player 1 at the bottom, with every card always in view. Click **Ready** / **Used** to exhaust or ready a card; the counter shows what is still available. **+** opens a row to add a card or ready them all. The **i** above the bottom panel explains the cards when you point at it.

## Example armies

Under **Import army list**, the list **Or an example army from the rulebook** holds the six example armies of the rulebook (12.12): Terran Armed Forces, Raynor's Raiders, Zerg Swarm, Kerrigan's Swarm, Daelaam and Khalai, 1000 Minerals each. Choosing one fills in the list box with its units, upgrades, Faction and Tactical cards, missions and deployments; pick the player and press **Add army to table**.

## Dice from the selected unit

With the card library loaded and a model selected, a Hit roll shows the unit's weapons from its card as buttons between the kind of roll and the dice. Picking one fills in the dice: its RoA times the unit's models still alive that carry it, its Hit value and its surge die (D3, D3+1 or D6). Selecting another unit, or the unit losing a model, fills them in again. **An attack:** select a model of the attacking unit, then Ctrl+click (or Shift+click) a model of the target unit. The dice box shows *Attack: attacker → target*: Hit rolls use the attacker's weapons, and **target has the surge tag** is ticked when the weapon's surge type is one of the target's Combat Tags; Armour and Evade use the target's values; the roll history names the attack. In **Armour** or **Evade**, selecting a unit fills in its Armour or Evade value from its card. Switching to **Armour** after a hit roll takes its hits minus the surge hits that skip armour (those wait in the damage pool); switching to **Evade** after an armour roll takes its failed saves plus those surge hits. A Blast Template weapon (RoA BT+4) starts at 5 dice; change it by hand as needed. **Surge** is None, D3, D3+1, D6 or **Set**: a value you type in, for surge no die decides (the Siege Tank's Shock Cannon, surge BT, picks Set). **Critical hit** is a number: that many successful hits skip Armour, like a matching surge but against any unit; a weapon with CRITICAL HIT (n) among its keywords fills it in. **Precision** (Hit rolls) turns up to that many failed dice into hits, surge included; a weapon with PRECISION (n) fills it in. **Tough** (Armour rolls) turns up to that many failed saves into saves. The dice it changes show with a dashed edge. Choose **By hand** to set the dice yourself. Only upgrades the unit bought are offered. A SPECIALIST upgrade goes to one model on import (named after it, e.g. *Marine 6 (AGG-12)*): its weapon rolls for that model, and if it replaces a weapon, the standard weapon rolls for one model fewer. While an attack is selected, the attacker's weapon profiles show at the top of the board with the target's defence and the distance between the units; weapons out of range are dimmed, and clicking a row picks that weapon for the dice.

### Blast Template

Right-click an empty spot and choose **Place Blast Template here**, or right-click a model and choose **Place Blast Template on it**. It is a see-through 5″ circle for now (the exact size is still to be checked), drawn over the models; drag it into place. While it is selected, every model whose base it covers, even partly, shows **HIT**, and a line above it counts the covered models per unit. Clicking a model under it picks the model; the template is picked where no model is.

## Online play

Press **Play online** at the top, choose **Start online game with this board** and send the other player the link (**Copy link**). They need no account.

- The player who starts the game hosts it. Their browser keeps the game and passes every change to the other players, so **the host keeps the tab open**. If the host reloads or comes back later in the same browser, the game continues where it was and the others reconnect on their own.
- The browsers connect directly to each other (WebRTC, through [PeerJS](https://peerjs.com/)). PeerJS's free public service only introduces them; the game itself doesn't go through it.
- Some strict networks (some company, school or mobile networks) block direct connections. Players behind one can't join.
- Anyone who has the link or the code can join and change the board.
- Spectators can watch too: they join and pick **Spectator**.

## Disclaimer

A fan-made tool, not affiliated with or endorsed by Blizzard Entertainment or any game publisher. The unit symbols on the bases are drawn for this page and contain no official art.
