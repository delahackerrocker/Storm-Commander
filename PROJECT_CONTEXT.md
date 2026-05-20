# Project Context

Storm Commander is currently a tactical Chess-ish prototype. The project started with a Unity-oriented chess vertical slice, then shifted into a React/Vite browser prototype so gameplay and presentation ideas could be tested quickly.

The root workspace contains both `UnitySource/` and `ReactSource/`. The active playable prototype is in `ReactSource/`.

## What The Prototype Does

The React app provides a local chess loop:

- Human controls White.
- Computer controls Black.
- White moves first.
- Chess legality is handled by `chess.js`.
- The computer opponent is custom and simple: it chooses legal moves and prefers higher-value captures.
- Pawn promotion is simplified to Queen promotion.
- The app shows game status, move history, legal move highlights, capture highlights, and last move state.

The main menu has two playable entries:

- `basic chess` opens Standard Chess.
- `Storm Commander` opens the Storm Commander visual variant.

Both variants share the same gameplay logic. The difference is presentation.

## Standard Chess

Standard Chess uses the shared gameplay shell with standard piece rendering and its own stylesheet:

- Page wrapper: `standard-chess-root`
- Styles: `ReactSource/src/styles/standardChess.css`

## Storm Commander

Storm Commander currently plays like the chess prototype but uses local PNG ship-piece art and a more atmospheric presentation.

Current Storm Commander work includes:

- Local PNG pieces in `ReactSource/public/assets/chess/storm-commander/pieces/`
- Four faction fleets in `ReactSource/public/assets/chess/storm-commander/factions/`
- Faction-dominant generated ship palettes, with Pirate locked as the bright-orange/black player faction
- Faction IDs and visual themes in `ReactSource/src/chess/stormCommanderPieceAssets.js`
- Random opposing faction selection in `ReactSource/src/chess/stormCommanderFactions.js`
- Directional starfield motion in `ReactSource/src/chess/stormCommanderStarfield.js`
- Storm Commander-specific styles in `ReactSource/src/styles/stormCommander.css`

Storm Commander is still not a new rule set. It is currently a visual variant and experimental presentation layer on top of the same chess rules.

## Scenario And Puzzle Data

The prototype includes a scenario and puzzle layer for loading interesting positions from FEN.

Important files:

- `ReactSource/src/chess/scenarios/curatedScenarios.json`
- `ReactSource/src/chess/scenarios/scenarioLoader.js`
- `ReactSource/src/chess/scenarios/scenarioFilters.js`
- `ReactSource/src/chess/scenarios/scenarioMetadata.js`
- `ReactSource/scripts/buildPuzzleScenarios.mjs`

The scenario JSON is intentionally plain and portable so it can be consumed by Unity later. Optional fields should stay explicit and JSON-safe, using `null` instead of JavaScript-only values.

## Long-Term Direction

React is the fast prototype shell. The durable design work should remain easy to port:

- Keep scenario data as stable JSON.
- Keep chess-specific logic separated from React components where practical.
- Keep asset paths centralized.
- Avoid baking Storm Commander-specific assumptions into generic chess helpers.
- Keep Standard Chess and Storm Commander presentation ownership separate.

The eventual Unity rebuild should be able to reuse the lessons from the React prototype, the scenario data shape, and the stable art organization.
