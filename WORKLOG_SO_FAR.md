# Worklog So Far

This is a compact narrative of what has been built in the Storm Commander / Chess-ish workspace so far.

## 1. Initial Chess-ish Direction

The first task described a Unity 6.3 LTS chess vertical slice under `UnitySource/`. It established the gameplay target: a local human-vs-computer chess-like prototype with White controlled by the player, Black controlled by a basic capture-priority opponent, simple board visuals, and no advanced systems.

That Unity-oriented task is still useful as long-term direction, but active iteration moved into a browser prototype for speed.

## 2. React/Vite Chess Prototype

The project then created a React/Vite prototype in `ReactSource/`.

Built pieces:

- React app shell and menu flow.
- Custom CSS-grid chess board.
- Click-to-select and click-to-move input.
- Legal move generation through `chess.js`.
- Game status text for turn, check, checkmate, stalemate, and draw.
- Move history panel.
- Greedy Black computer move selector in `ReactSource/src/chess/selectComputerMove.js`.
- Vitest coverage for the move selector and app smoke behavior.

This established the reliable playable loop.

## 3. Scenario And Puzzle Library

The next layer added curated chess scenarios and puzzle-style positions.

Built pieces:

- `curatedScenarios.json` with local seed positions.
- Theme filtering, including `promotion`.
- Random scenario and random puzzle loading.
- Metadata display for FEN, source, mode, rating, themes, side to move, piece count, and material summary.
- FEN copy and current-scenario reset controls.
- Import tooling for Lichess-style puzzle CSV data.
- Tests for scenario filtering, loading, metadata, and importer behavior.
- Documentation for scenario JSON format and manual testing.

The scenario layer is intentionally portable for a future Unity rebuild.

## 4. Storm Commander Entry And Local Art

The menu gained a second entry named `Storm Commander`.

Built pieces:

- Standard Chess and Storm Commander now use the same chess game shell.
- Storm Commander renders pieces from local PNG files.
- Piece asset paths are centralized.
- The initial required 12 side-based piece PNGs were added under `ReactSource/public/assets/chess/storm-commander/pieces/`.
- Documentation explains how those PNGs can be replaced while keeping filenames stable.

At this point Storm Commander was still chess rules with different visuals.

## 5. Separate Style Ownership

The styling was split so Standard Chess and Storm Commander can evolve independently.

Built pieces:

- `ReactSource/src/styles/standardChess.css`
- `ReactSource/src/styles/stormCommander.css`
- Standard wrapper class: `standard-chess-root`
- Storm Commander wrapper class: `storm-commander-root`
- Tests confirming both variants render through their own roots and Storm Commander keeps PNG pieces.

The split matters because the two experiences are becoming visually different products.

## 6. Factions, Starfield, And Visual Polish

Recent Storm Commander work pushed beyond placeholder PNGs into a stronger sci-fi identity.

Built pieces:

- Four faction fleets: `pirate`, `imperial`, `robocorp`, and `rebel`.
- Faction-specific piece asset folders under `ReactSource/public/assets/chess/storm-commander/factions/`.
- Random White-vs-Black faction matchups.
- Faction tinting for board and highlight accents.
- Directional starfield movement.
- Piece rotation tied to starfield direction.
- Faction-dominant ship palettes, with Pirate tuned as the bright-orange/black player faction, Imperial shifted to ivory-white hulls with bold gold signal color, and runtime rocket exhaust using faction-tinted glow.
- Regenerated faction fleets with more distinct role silhouettes, crisp alpha cutouts with no baked oval/drop-shadow bases, a WWII-fighter-style Knight, and a smaller one-engine Pawn.
- Pushed the Queen toward a hammerhead command-ship silhouette so it reads as a distinct high-value piece.
- Versioned Storm Commander PNG URLs so the browser fetches regenerated ship art instead of reusing stale cached images.
- Additional visual polish and test updates.

The current effect is that Storm Commander feels more like a space-command board while still using chess legality underneath.

## Current Verification Habit

Use these from `ReactSource/` after meaningful changes:

```bash
npm.cmd run build
npm.cmd run test
```

Use `npm.cmd run dev` for manual browser playtesting.

## 2026-09-28 — Approved Title Art And Opening Radio

- Saved all four approved faction title screens and all eight commander portraits to `ReactSource/public/assets/storm-commander/`, retaining original masters and source notes in `output/commander-art-v1/`.
- Replaced the start menu with a whole-screen play target and a three-second title-art rotation with crossfades. It launches only Storm Commander random matches.
- Added a keyed mission session so every new encounter starts its own two-call radio exchange without replaying on board updates. Pirate command enters/exits left; hostile command enters/exits right. Each call lasts five seconds or dismisses on tap/keyboard, followed by a short exit animation.
- Added three contextual mission lines per objective type and ten enemy taunts, new commander portraits in radio/ship panels, brief synthesized radio cues, and a mute toggle. Written dialogue only, as requested.
- Gated ship selection, movement, AI scheduling, and background motion during the opening exchange. Retained the manually opened Mission details panel.
- Added sequence/timing, early-dismissal, faction/objective, match-reset, AI-pause, and title-cycle coverage. Tested the flow in desktop, phone portrait, and phone landscape Chrome via Playwright; native iOS/Safari have not been exercised for this change.

## 2026-09-28 — Arcade Combat Sound Effects

- Added local Web Audio effects with a simple NES/SNES-inspired character: five falling square-wave laser shots aligned with the volley, followed by a low triangle-wave thump and stepped noise burst at the explosion.
- Pirate and enemy captures share the same effects; ordinary moves remain quiet. Sound playback is canceled when the combat animation is removed, and the noise generator does not consume gameplay randomness.
- Unified radio/combat audio under `src/storm-commander/audio/gameAudio.js`. The shared Sound toggle is available during opening transmissions and on the battlefield, stops active effects when muted, and keeps its setting between matches.
- Verified both factions' capture triggers, quiet movement, cancellation, sound timing, mute behavior, and missing-audio-API fallback. All 119 tests pass; lint and production build pass.


## 2026-09-28 — Turn Notices And Release Preparation

- Added faction-colored turn messages beneath the desktop board. On touch/mobile layouts they blink over the board until the next game-area touch, and reset each turn.
- Corrected transmission directions: Pirate/player enters and exits right; enemy enters and exits left.
- Added a 600ms black fade after Play and blocked radio tap/keyboard dismissal until two seconds after that initial press.
- Synced the Capacitor wrapper and incremented iOS version 1.01 to build 7.
- All 121 tests pass, including transition timing and turn notice behavior.

## 2026-09-28 — iPhone Portrait Title Art

- Added four dedicated portrait compositions retaining both faction commanders and the small Press to Play prompt, with Orange/Pirates first. Corrected the purple commander’s foreground hand to an armored fist surrounded by magical aura.
- Phones up to 600 CSS pixels wide select portrait artwork; rotating to landscape restores the original wide composition. Preserved three-second crossfades and the launch/radio input guard.
- Saved artwork and generation notes in the repository; synced Capacitor and advanced iOS version 1.01 to build 8.
- Validation: all 121 tests, lint, and production build pass. Browser checks passed at 375×667, 393×852, and 430×932 for all four images, rotation, and Play/radio flow. Native iPhone 17 simulator build and launch passed; title and prompt clear the system safe areas.
- Release: published the portrait update to `https://practitioner.digital/storm_commander/`. Archived and uploaded version 1.01 (8) to the existing App Store Connect app; Xcode reported upload/export success and Apple package processing.
