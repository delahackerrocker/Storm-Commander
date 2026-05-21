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

- The app starts directly in a Storm Commander random encounter.
- Use the bottom-right `Debug` button to open the legacy `Basic Chess` and `Storm Chess Drill` views.
- Debug views can use `Back` to return to the random encounter.
- Use the Scenario Library panel to load random scenarios or puzzles.
- Use the Theme Filter to choose tactical themes, including `promotion`.
- Human plays White.
- Computer plays Black.
- Click a White piece, then click a highlighted destination.
- Pawns always promote to Queen.
- Use New Game to reset the board.

Chess legality, check, checkmate, stalemate, draw state, legal movement, castling, en passant, and promotion validation come from chess.js. The computer opponent is custom and greedily chooses the highest-value capture available, with random tie-breaking.

## Scenario Import

```bash
node scripts/buildPuzzleScenarios.mjs --help
```

The importer reads a local Lichess-style puzzle CSV and writes a small curated JSON scenario library. Do not commit the full raw CSV.

## Storm Commander Art

Storm Commander PNG placeholders live at `public/assets/chess/storm-commander/pieces/`. The code maps pieces to those files in `src/chess/stormCommanderPieceAssets.js`, so art can be replaced later without changing component code.

## Variant Styles

Standard Chess styling lives in `src/styles/standardChess.css` under `.standard-chess-root`.

Storm Commander styling lives in `src/styles/stormCommander.css` under `.storm-commander-root`.

`src/styles.css` is reserved for global shell styles such as the reset, root font, and debug dock.
