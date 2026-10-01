# Worklog So Far

## 2026-10-01 — Adaptive Difficulty Default

- Made Adaptive, the third difficulty option, the default for new players and invalid/missing settings. Moved the default badge and preserved valid saved choices.
- Validation: all 159 tests, lint, and production build pass. Updated the mission briefing assertion for Adaptive.
- Release: deployed the web update and verified the live Adaptive default, saved Standard preference, and JavaScript/CSS hashes. Synced iOS version 1.01 build 15; signed archive passed and all 92 bundled files matched the mobile build. App Store Connect confirmed upload success and package processing for TestFlight.

## 2026-09-29 — Clearer Unit Identification

- Follow-up: reshaped all four Knight variants with a wide short stern, medium-width fuselage, asymmetric east-facing L nose, and contrasting eye sensor. Kept angular mechanical armor and three engines. Regenerated faction/legacy Knight assets, refreshed the art cache version, inspected the fleet preview, and passed alpha validation and production build.
- Reshaped Pawn ships into narrow scouts with wide rear blocks, and Rooks into rectangular, battlement-front ships with an abrupt wider stern. Regenerated all four faction variants and legacy side assets; bumped the art cache version.
- Replaced duplicate ship art beside movement patterns with upright ivory chess-piece silhouettes for all six roles, in both player and opponent details panels.
- Validation: all 159 tests, lint, and production build pass. Inspected the regenerated fleet sheet and Chrome desktop/393px phone panels. Preview screenshots are in `output/unit-readability/`.
- Release: deployed to `https://practitioner.digital/storm_commander/` and verified the live index, JavaScript/CSS, and all 18 updated ship images against the tested build. Live desktop and phone smoke checks passed. Synced iOS version 1.01 build 14, passed the native iPhone 17 simulator build/launch and signed archive, and verified all 92 bundled web files against the mobile build. Uploaded build 14 successfully to App Store Connect for TestFlight; Apple reported package processing.

## 2026-09-29 — Pirate Fleet Introduction

- Added a briefing between the rotating title screen and mission opening radio, using the requested copy and the existing Prank Sumatra / Captain Lilith Haraway portraits. Press to Begin launches the mission and starts a fresh two-second radio input guard.
- Wide layouts place the crew on the left and text on the right; phone layouts center the text and button above the crew.
- Validation: all 159 tests, lint, and production build pass. Browser verification covered the title → intro → mission flow and phone widths of 393 and 375 pixels.
- Approved after desktop and mobile preview. Deployed the web update and verified the live intro plus exact JavaScript/CSS asset hashes; the hosting provider adds its usual monitoring script to HTML.
- Synced the iOS wrapper and advanced version 1.01 to build 13. Native iPhone 17 simulator build/run, intro layout, mission launch, and signed release archive passed. Archive assets match the synced web build. After explicit TestFlight approval, uploaded version 1.01 (13) successfully to the existing App Store Connect app. Xcode reported upload/export success and Apple package processing.

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

## 2026-09-28 — Organic Starfield And Receding Debris

- Replaced repeating star/asteroid tiles with an irregular canvas starfield, with independent positions, brightness, sizes, and parallax depth. Cosmetic randomness is isolated from encounter generation and AI.
- Occasional irregular asteroids and fragments enter from the upstream board edge at 25–50% of ship size. They follow the stars’ changing heading, tumble, and shrink/fade away in 1.7–3 seconds.
- Captures emit seven fragments at the destroyed ship position at the 900ms explosion impact. Fragments survive the end of the move animation and obey the same drift and recession rules.
- Rendering is capped at 30fps and 2× pixel density, with a bounded particle count. Radio/mission pauses, hidden tabs, reduced-motion preferences, and teardown stop animation work.
- Validation: 133 tests pass; lint and production build pass. Desktop and 393px phone browser checks verified ambient particles, capture timing, shrinking after capture, mission pause, and static reduced-motion mode.
- Synced the iOS wrapper and advanced version 1.01 to build 9 for release.
- Release completed: demo deployed and verified in a phone browser; native simulator build/run and visible starfield verified. Version 1.01 (9) uploaded successfully to App Store Connect for TestFlight and entered Apple processing.

## 2026-09-28 — iOS Build 10

- Rebuilt and synced the current game into the Capacitor wrapper, advanced version 1.01 to build 10, and verified the simulator build/run and release archive.
- Uploaded build 10 successfully to the existing App Store Connect app for TestFlight; Apple reported package processing.
- In the companion practitioner.digital repository, changed all six phone screenshot captions to Mobile, committed/pushed, deployed, and verified the live labels.

## 2026-09-28 — Random Mission Opening Balance

- Target and extraction missions now evaluate every legal Pirate opening move with the actual victory rules. Immediately winnable objectives are relocated through a shuffled, finite candidate list; extraction squares must also start empty and remain on the board edge.
- If no safe candidate exists in the original layout, the same ships are redeployed to opposing edges and checked again. Ship identities, faction assignments, values, and objective type are preserved; no unbounded reroll loop.
- Capture-value goals now require 75–90% of enemy fleet value, rounded up, with a minimum of five points and more than the largest individual ship. The goal never exceeds the available fleet value. Small fleets may therefore require complete destruction.
- Validation: all 140 tests pass, including 2,000 seeded encounters covering all board sizes and objective types, target relocation, occupied/reachable extraction, safe-layout preservation, and a fully occupied edge fallback. Lint and production build pass.
- Synced the iOS wrapper and advanced version 1.01 to build 11 for release.
- Release completed: committed/pushed the balance update, deployed the web demo, verified its JavaScript matches the tested build, and passed the live mobile opening-radio/gameplay smoke check. Native simulator build/run and signed archive passed; version 1.01 (11) uploaded successfully to App Store Connect and entered Apple processing for TestFlight.

## 2026-09-28 — Modest Enemy AI Increase

- Added a shallow tactical check to capture-focused enemy move selection. Each candidate checks the Pirate player's next legal replies, discounts exposed fleet value by 65%, and penalizes allowing an immediate mission victory. Enemy fleet-destruction wins take priority.
- Retained random selection among similarly scored moves, with no deeper search or positional scoring. The enemy still takes favorable exchanges but avoids obvious bait and can defend a marked ship or block extraction.
- Validation: all 145 tests pass, including bait avoidance, profitable exchanges, extraction defense, target protection, unchanged input state, and randomized equivalent choices. Lint and production build pass.
- Synced the iOS wrapper and advanced version 1.01 to build 12. Commander personalities and adaptive difficulty remain proposed future options, outside this release.

## 2026-09-28 — Difficulty Modes And Mission-Aware Commanders

- Extended the final build-12 batch with Standard, Commander Styles, and Adaptive choices in a shared difficulty panel on the title screen and battlefield. Settings persist locally; changing a setting affects the next match, and the open panel pauses board input and AI. Native dialog behavior supplies modal focus handling and Escape dismissal.
- Authored bold/measured styles per commander. Rebels use the gentlest faction tuning, Robocorp slightly stronger, and Imperials strongest within a narrow range. Both character styles defend marked ships/fleet value during target/capture missions and pursue Pirates during survival/extraction missions. The commander identity is frozen at mission creation and shared by opening radio, tactics, and the opponent portrait.
- Adaptive starts at the commander baseline, increases one small step after each win, decreases two after each loss, and clamps to levels 0–8. Only completed adaptive matches count, each once; unfinished/abandoned matches and other modes do not alter progress. Current-match difficulty stays fixed even if settings change.
- The initial modest AI web update completed before the scope expanded. Held the TestFlight upload and final deployment until this complete batch was ready.
- Validation: 159 tests across 27 files pass; lint and production build pass. Browser checks at 1440×1000, 393×852, 375×667, and 852×393 verified dialog fit, saved settings, keyboard dismissal/focus return, fixed current-match mode, consistent portraits, and footer fit. Native iPhone 17 simulator build/run and difficulty selection/persistence verified; restored Standard after the check.
- Release completed: pushed all changes, deployed the final web demo, and verified production JavaScript/CSS against the tested build. Archived the complete iOS update as version 1.01 (12), verified its bundled assets, and uploaded successfully to App Store Connect; Apple reported package processing for TestFlight.
