# Chess-ish React Prototype

Playable local chess prototype built with React, Vite, JavaScript, CSS, and chess.js.

## Commands

```bash
npm.cmd run dev
npm.cmd run build
npm.cmd run test
```

`npm.cmd run build` writes the deployable static site to `dist/` with `/storm_commander/` as the asset base, matching `https://practitioner.digital/storm_commander/`.

## Play

- The title screen crossfades between the four approved faction illustrations every three seconds. Tap anywhere, or focus `Press to Play` and press Enter, to start a random match.
- Pressing Play fades to black over 0.6 seconds, then opens the radio exchange. Inputs remain locked until two seconds after the original press to prevent accidental skips.
- You always command the orange Pirate fleet against one opposing faction.
- Random target and extraction missions check every legal Pirate opening move and relocate the objective if it could be completed immediately. Extraction starts on an empty edge square. Capture-value goals scale with the enemy fleet (75–90% of its value, rounded up, with a minimum greater than any single ship).
- Enemy commanders favor captures but also check your immediate reply, avoiding obvious losing trades and protecting against an immediate mission win. Similar choices remain randomized for variety.
- Every new match opens with two radio transmissions: your Pirate commander slides in from the right with the objective, then an opposing commander slides in from the left with a taunt. Each stays for five seconds; tap anywhere or press Enter/Space/Escape to dismiss earlier.
- Transmissions use written dialogue, saved commander portraits, and synthesized radio chirps. `Sound on/off` mutes all game effects, during the radio exchange or from the battle controls. There is no spoken voice track.
- The battlefield uses irregularly scattered stars with varied depth and brightness. Occasional asteroids and space junk drift in with the stars at roughly one-quarter to one-half ship size, shrinking away within about two to three seconds. Destroyed ships shed fragments that follow the same drift and recession. Motion pauses for radio/mission overlays and hidden tabs; reduced-motion mode keeps the starfield still.
- Captures play a short arcade laser volley followed by a crunchy ship-destruction burst, synchronized with the attack and explosion animations for both fleets. Ordinary movement stays quiet.
- The board and enemy AI wait until both transmissions have left. Select a Pirate ship, then a highlighted destination to move or capture.
- A faction-colored turn notice reads “Your move commander!” or “Enemy is moving!”. It sits below the board on desktop; on touch layouts it blinks over the board and hides when you touch the game area, reappearing on the next turn.
- `Mission` reopens detailed objectives. `Back` returns to the title screen. After a win or loss, `Next Mission` starts another random match and a fresh radio exchange.
- Other chess modes and the character roster are hidden from navigation; their components and scenario importer remain available for future development.
- Upright phones up to 600 CSS pixels wide use dedicated full-screen portrait title illustrations; rotation and wider screens use the original landscape art. Reduced-motion preferences disable the crossfade and sliding animations while retaining the sequence.

Opening dialogue is in `src/storm-commander/comms/openingRadio.js`: three objective-specific variants for each of the four mission types, plus ten enemy taunts. The encounter ID fixes the choice throughout a match.

## Scenario Import

```bash
node scripts/buildPuzzleScenarios.mjs --help
```

The importer reads a local Lichess-style puzzle CSV and writes a small curated JSON scenario library. Do not commit the full raw CSV.

## Storm Commander Art

The approved four title screens and eight commander portraits are saved under `public/assets/storm-commander/`. See that folder's `README.md` for the inventory and source. PNG masters, deck references, and prompts remain in `../output/commander-art-v1/`.


Storm Commander PNG placeholders live at `public/assets/chess/storm-commander/pieces/`. The code maps pieces to those files in `src/chess/stormCommanderPieceAssets.js`, so art can be replaced later without changing component code.

## Variant Styles

Standard Chess styling lives in `src/styles/standardChess.css` under `.standard-chess-root`.

Storm Commander styling lives in `src/styles/stormCommander.css` under `.storm-commander-root`.

`src/styles.css` is reserved for global shell styles such as the reset, root font, and Start Menu.
