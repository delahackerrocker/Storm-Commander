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
