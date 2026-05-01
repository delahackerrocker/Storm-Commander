# 20260501_Chessish_Task_03_Storm_Commander_Menu_And_PNG_Pieces

## Agent Thinking Level

Medium. This is a focused routing / presentation task, not a gameplay-expansion task.

## Safety / Repo Rule

Before making changes, check git status.

If there are uncommitted local changes, stop and ask Dela before proceeding.

## Goal

Update the React chess prototype so the main menu has a second button named:

```text
Storm Commander
```

That button should open a second chess variant that currently plays the same as the main chess prototype, but renders its chess pieces from local PNG files instead of Unicode glyphs or text labels.

This is a prototype that will eventually be rebuilt in Unity. Keep the art-path and scenario assumptions clean and portable.

## Important Scope Note

Do not invent Storm Commander gameplay rules in this task.

For now, Storm Commander is only a visually separate variant of the existing chess game.

The primary difference between the two versions right now:

```text
Main Chess:
  Uses the existing piece rendering approach.

Storm Commander:
  Uses local PNG piece assets from the project.
```

Future tasks will define how Storm Commander differs mechanically.

## Main Menu Requirement

Locate the app's main menu / landing page / mode-select page.

Update the buttons so that:

1. The first chess button continues to launch the current main chess experience.
2. The second button is labeled exactly:

```text
Storm Commander
```

3. Clicking `Storm Commander` opens the Storm Commander chess variant.
4. The second button should be visibly available on the main menu.
5. Do not break any existing main menu buttons or navigation.

If routes are already used, add a route similar to:

```text
/storm-commander
```

If the app uses local state instead of routes, add a clear mode value similar to:

```js
mode: "storm-commander"
```

Prefer whatever pattern the current prototype already uses.

## Storm Commander Variant Behavior

Storm Commander should initially behave like the main chess prototype:

- Human controls White.
- Computer controls Black.
- White moves first.
- Existing chess legality remains powered by `chess.js`.
- Existing greedy computer move logic still works.
- Scenario / puzzle loading should continue to work if it already exists.
- New Game should still work.
- Turn/status UI should still work.
- Move highlighting should still work.
- Captures should still work.
- Promotion should still work.

Do not duplicate chess rules if the existing code can be reused.

Storm Commander should reuse the existing chess game components as much as possible, with piece rendering passed in as a variant/config option.

## Local PNG Piece Library

Create a local PNG piece library in the project.

Use a stable path such as:

```text
public/assets/chess/storm-commander/pieces/
```

Create all 12 standard piece PNGs:

```text
white-king.png
white-queen.png
white-rook.png
white-bishop.png
white-knight.png
white-pawn.png

black-king.png
black-queen.png
black-rook.png
black-bishop.png
black-knight.png
black-pawn.png
```

These PNGs are placeholders for now.

Dela will later replace or modify these PNGs graphically, so the filenames and paths must remain stable.

## Placeholder PNG Requirements

For this task, placeholder PNGs can be simple.

Acceptable placeholder art:

- Transparent background.
- Clear chess-piece letter or icon.
- White pieces visually distinct from black pieces.
- Enough resolution to replace later without changing code.

Suggested size:

```text
512x512 PNG
```

Suggested placeholder labels:

```text
White King: WK
White Queen: WQ
White Rook: WR
White Bishop: WB
White Knight: WN
White Pawn: WP

Black King: BK
Black Queen: BQ
Black Rook: BR
Black Bishop: BB
Black Knight: BN
Black Pawn: BP
```

If the environment has an image-generation utility such as Python Pillow available, use it to generate the placeholder PNGs.

If Pillow is not available, use any simple reliable local method to create valid PNG files.

Do not use remote image URLs.

Do not hotlink external chess-piece art.

Do not require network access at runtime.

The final Storm Commander pieces must load from local project files.

## Piece Asset Mapping

Create a single source of truth for Storm Commander piece image paths.

Suggested file:

```text
src/chess/stormCommanderPieceAssets.js
```

Suggested shape:

```js
export const STORM_COMMANDER_PIECE_ASSETS = {
  w: {
    k: "/assets/chess/storm-commander/pieces/white-king.png",
    q: "/assets/chess/storm-commander/pieces/white-queen.png",
    r: "/assets/chess/storm-commander/pieces/white-rook.png",
    b: "/assets/chess/storm-commander/pieces/white-bishop.png",
    n: "/assets/chess/storm-commander/pieces/white-knight.png",
    p: "/assets/chess/storm-commander/pieces/white-pawn.png"
  },
  b: {
    k: "/assets/chess/storm-commander/pieces/black-king.png",
    q: "/assets/chess/storm-commander/pieces/black-queen.png",
    r: "/assets/chess/storm-commander/pieces/black-rook.png",
    b: "/assets/chess/storm-commander/pieces/black-bishop.png",
    n: "/assets/chess/storm-commander/pieces/black-knight.png",
    p: "/assets/chess/storm-commander/pieces/black-pawn.png"
  }
};
```

Use this mapping in the piece renderer.

Do not scatter image path strings across multiple components.

## Component Architecture

Refactor only as much as necessary.

Preferred approach:

```text
ChessGame
  receives variant or pieceSet prop

ChessBoard
  passes piece render mode down

ChessPiece
  renders either:
    - normal main-chess piece display
    - Storm Commander PNG image
```

Suggested variant value:

```js
variant="classic"
variant="storm-commander"
```

or:

```js
pieceSet="unicode"
pieceSet="storm-commander-png"
```

Use whichever is cleaner for the current codebase.

## Rendering Requirements

In Storm Commander:

- Every piece should render as an `<img>`.
- Every image should use the local PNG path mapping.
- Image `alt` text should be clear, e.g. `White queen`.
- Images should fit cleanly inside the board square.
- Images should not block click selection.
- Selection/highlight logic should still work.
- Captures should remove image pieces just as they removed glyph pieces.

Suggested CSS:

```css
.chess-piece-image {
  width: 82%;
  height: 82%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}
```

## Main Chess Must Remain Unchanged

The existing main chess version should keep its current visual style unless a tiny refactor is needed.

Acceptance requirement:

```text
Main Chess still renders pieces the way it did before.
Storm Commander renders pieces from PNGs.
```

Do not convert both versions to PNG unless Dela explicitly asks later.

## Documentation

Create or update a short doc:

```text
docs/20260501_Chessish_Storm_Commander_PNG_Piece_Library.md
```

Document:

1. Where the PNG files live.
2. The required filenames.
3. How Dela can replace the art later.
4. Which component maps chess pieces to PNGs.
5. Any size / transparency recommendations.

Keep it practical and brief.

## Testing Requirements

Add or update tests if the project has tests.

At minimum, test:

1. Main menu renders a button labeled `Storm Commander`.
2. Clicking `Storm Commander` opens the Storm Commander variant.
3. Storm Commander renders piece images.
4. Storm Commander piece image paths point to local `/assets/chess/storm-commander/pieces/` PNGs.
5. Main Chess still renders without requiring Storm Commander PNG mode.
6. Existing move selection still works after the refactor, if covered by current tests.

Suggested test file:

```text
src/tests/stormCommanderVariant.test.jsx
```

If component testing is not currently reliable, add these checks to the manual checklist instead and explain why automated coverage was not added.

## Manual Test Checklist

Create or update:

```text
docs/20260501_Chessish_Task_03_Storm_Commander_Manual_Test_Checklist.md
```

Include:

1. App starts with no console errors.
2. Main menu appears.
3. The second button is labeled `Storm Commander`.
4. Clicking `Storm Commander` opens the Storm Commander chess variant.
5. Storm Commander board appears.
6. Storm Commander pieces render from PNGs.
7. All 12 PNG files exist locally.
8. Replacing one PNG file changes that piece visually in Storm Commander.
9. White can move first in Storm Commander.
10. Black computer responds in Storm Commander.
11. Captures still work in Storm Commander.
12. Promotion still works in Storm Commander.
13. Main Chess still opens.
14. Main Chess still uses its previous piece rendering.
15. No remote image URLs are required.

## Acceptance Criteria

This task is complete when:

- Main menu has a second button labeled exactly `Storm Commander`.
- The `Storm Commander` button opens a second chess variant.
- Storm Commander currently plays like the main chess prototype.
- Storm Commander uses local PNG files for chess pieces.
- All 12 local placeholder PNGs exist.
- The piece PNG paths are centralized in one mapping file.
- Dela can replace PNGs later without changing code.
- Main Chess still works and keeps its existing piece visuals.
- The project builds with no errors.
- Normal play produces no console errors.
- Documentation explains the PNG piece library.
- The task does not add new Storm Commander gameplay rules.

## Non-Goals

Do not implement:

- New Storm Commander rules
- New unit types
- Campaign systems
- Scenario authoring
- Multiplayer
- Online play
- Accounts
- Save/load
- Sound
- Animation polish
- 3D board
- Unity implementation
- Final piece art
- Remote image fetching
- External chess-piece art downloads

## Final Report Back To Dela

When finished, report:

1. What files were created or changed.
2. Where the Storm Commander button lives.
3. What route or mode opens Storm Commander.
4. Where the local PNG pieces live.
5. How to replace the PNG art later.
6. How the piece path mapping works.
7. What tests were added or updated.
8. Any known limitations or TODOs.
