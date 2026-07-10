# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Werewolf in the Woods" is a single-page web app that acts as a moderator/storyteller
assistant for an in-person social deduction game (a Werewolf/Mafia variant). One
person runs it on a phone or tablet to track players, secretly assign roles, and step
through the night/day phases while the actual game is played face-to-face.

There is no backend. It's plain HTML/CSS/vanilla JS with no framework, no build step,
no package manager, and no test suite.

## Running it

There is no build/lint/test tooling in this repo. To work on it:

- Open `index.html` directly in a browser, or serve the folder with any static file
  server (e.g. `npx serve .`) — either works since everything is relative script tags.
- There is no bundler, transpiler, or type checker. Changes to `.js`/`.css`/`.html`
  files take effect on page reload.
- To verify a change, actually click through the app in a browser (new game → pick
  players → select roles → assign → reveal → play a few night/day cycles). There are
  no automated tests, so this is the only way to catch regressions.
- Game state persists to `localStorage` (see `js/storage.js`, key `witw_state`). Clear
  it (`localStorage.removeItem('witw_state')`, or "New Game") to reset to a clean state
  while testing, otherwise a stale saved game will auto-restore on load.

## Architecture

### Global state, no modules

All scripts are loaded as plain `<script>` tags (no `type="module"`, no bundler), in
this order from the bottom of `index.html`:

```
storage.js → utils.js → data.js → state.js → setup.js → game.js → player.js
```

Every function and the single `state` object (defined in `js/state.js`) live in
global scope. Functions in an earlier-loaded file can safely call functions defined in
a later-loaded file (e.g. `game.js` calls `showReminder()` from `player.js`) because
nothing executes until the user interacts, by which point every script has loaded.
Because there's no module system, watch for accidental duplicate `function` names
across files — the last declaration silently wins, and there's no bundler to catch it.

`state` (in `js/state.js`) is the single source of truth for the whole app: player
list, role selections made during setup, the `assigned` array (one entry per player
once roles are dealt), and a set of per-role "target" maps used during play (see
below). Almost every user action mutates `state` directly and then calls
`saveState()` (`js/storage.js`) to persist it to `localStorage`.

### Screen flow (pre-game setup)

`index.html` contains every screen as a `<div class="screen" id="screen-...">`, all
present in the DOM at once; `showScreen(id)` (`js/utils.js`) toggles which one is
visible. The setup flow, driven by `js/setup.js`, moves through:

```
screen-home → screen-players → screen-monster → screen-minion → screen-outcast
→ screen-villager → screen-summary → screen-showroles → screen-reveal → screen-game
```

- `screen-monster` is single-select (`buildSingleGrid`/`selectSingleRole`) — exactly
  one monster type, with a count.
- `screen-minion` / `screen-outcast` / `screen-villager` are multi-select
  (`buildMultiGrid`/`toggleMultiRole`/`changeMultiCount`) — any number of role types,
  each with its own count.
- Role definitions (id, name, icon, category, min/max count, display note) live in
  `ROLES` in `js/data.js`. `assignRoles()` in `setup.js` builds a shuffled pool from
  the selections (padding with plain Villagers) and writes it to `state.assigned`.
- `screen-showroles` / `screen-reveal` let the storyteller privately show each player
  their assigned role before the game starts.

### In-game screen (`screen-game`)

Once `assignRoles()` runs, the app moves into `js/game.js` territory:

- `renderArena()` lays players out in an arc and renders each as a "token" — an icon,
  name, and a stack of status overlays (ghost, monk-protected, farmer-watched,
  warlocked, quarantined) plus small icons flanking the name for knight-protection
  (⚔️) and lovers (💘). It's rebuilt from `state` on every change; there's no
  incremental diffing.
- The night phase is driven by `buildNightActions()` in `js/data.js`, which inspects
  which roles are alive and the current `state.round` to build an ordered list of
  step cards (wake monsters, wake minions, per-role actions, etc.) — the app doesn't
  hardcode a fixed night script. `openNightCarousel()`/`carouselNext()`/`carouselPrev()`
  in `game.js` step through that list.
- Tapping a player token opens the player modal (`openPlayerModal()` in
  `js/player.js`), which shows role info/history and a set of role-conditional action
  buttons (protect, set watch target, quarantine, change character, kill/execute,
  etc.). Each action has a matching `open*Picker()` (renders a target list) and
  `select*Target()`/`apply*()` function that mutates `state` and calls `saveState()`.

### Per-role "target" maps

Several roles (Monk, Farmer, Knight, Executioner, Warlock, Cobbler) choose another player
each night. Rather than storing that on the player object, it's kept in a map on
`state` keyed by the *acting* player's index → target index (e.g.
`state.monkProtections[monkIdx] = targetIdx`). `renderArena()` and the player modal
both read these maps to decide which overlays/buttons to show. When reassigning a
player's role mid-game (`applyCharacterChange()`), their own entries in all of these
maps are deleted — the effect they were producing is no longer in the game, even
though other players' maps that *target* them are untouched.

### Death, win conditions, and role-specific rules

`markPlayerDead(idx, method)` in `js/player.js` is the single path for a player dying
(`method` is `'executed'` or `'killed'`) — it's the only place that should ever set
`p.alive = false`. It special-cases roles that don't die normally on execution
(Monk-protected targets survive and lose their protection; the Tanner survives and
should be reassigned a new role) before falling through to the normal death path,
which clears the player's target-map entries, checks for chain effects (Knight
reminder, lovers must also die), and finally checks win conditions
(`checkLoneWolfWin()` takes priority over the general `checkEvilWin()`).

Avoid reintroducing a second path to "kill" a player (e.g. a raw alive-toggle) — this
codebase previously had one and it bypassed all of the above bookkeeping, which was a
real, shipped bug.
