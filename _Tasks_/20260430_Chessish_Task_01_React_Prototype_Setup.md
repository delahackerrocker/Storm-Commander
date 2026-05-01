# 20260430_Chessish_Task_01_React_Prototype_Setup

## Agent Thinking Level

Medium-high. This is a foundational gameplay prototype task. Keep the implementation simple, readable, and testable. Do not turn this into a full chess platform.

## Safety / Repo Rule

Before making changes, check git status.

If there are uncommitted local changes, stop and ask Dela before proceeding.

## Goal

Rewrite the first Chess-ish prototype as a React browser app.

Build a playable local chess prototype where:

1. The human player controls White.
2. The computer controls Black.
3. White moves first.
4. The app enforces legal chess movement.
5. The computer opponent chooses a valid move and prefers capturing higher-value pieces.

The computer opponent does not need to be smart. It just needs to understand legal moves and behave like a basic old-school chess opponent.

## Core Design Direction

This should feel closer to an early approachable computer chess app than a modern competitive chess platform.

Historical references for design thinking:

- **Sargon** — inspiration for the simple computer-opponent spirit: early computer chess, modest intelligence, readable turn-based play.
- **Chessmaster** — inspiration for accessibility and clarity: obvious board, clear status, easy local play.
- **Battle Chess** — inspiration only for future visual personality: captures can someday feel theatrical, but do not build animations in this task.

For Task 01, the priority is not spectacle. The priority is a correct, playable, browser-based chess loop.

## Technical Stack

Use:

```text
React
Vite
JavaScript
CSS
chess.js
Vitest
```

Use `chess.js` as the single source of truth for chess legality.

Important:

- `chess.js` may handle legal move generation, validation, turn state, check, checkmate, stalemate, FEN, and PGN.
- The computer opponent must still be custom.
- Do not import Stockfish.
- Do not import a real chess engine.
- Do not implement minimax.
- Do not add external AI services.

## Project Setup

If this is a new project, create it with Vite:

```bash
npm create vite@latest chessish -- --template react
cd chessish
npm install
npm install chess.js
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

If this is being added to an existing React/Vite project, preserve the existing project structure and add the chess prototype cleanly under `src/chess`.

## Required Folder Structure

Use this structure unless the existing project already has a clear equivalent pattern:

```text
src/
  App.jsx
  main.jsx
  styles.css

  chess/
    pieceValues.js
    selectComputerMove.js
    squareUtils.js

  components/
    ChessBoard.jsx
    ChessSquare.jsx
    ChessPiece.jsx
    GameStatus.jsx
    MoveHistory.jsx

  tests/
    selectComputerMove.test.js
    chessPrototypeSmoke.test.jsx
```

Keep logic separated from UI wherever practical.

## Required Player Experience

When the app runs:

1. The player sees an 8x8 chess board.
2. The board is oriented with White at the bottom.
3. White pieces and Black pieces are clearly distinguishable.
4. The player can click a White piece to select it.
5. Legal destination squares are highlighted.
6. Capture destination squares are visually distinct from quiet moves.
7. The player clicks a highlighted square to move.
8. Captured pieces are removed from the board.
9. Pawn promotion promotes to Queen automatically.
10. After the human move, the UI briefly shows `Black thinking...`.
11. The computer makes one legal Black move.
12. Turns alternate until the game ends.
13. The UI clearly displays check, checkmate, stalemate, draw, or winner state.
14. The player can start a new game with a simple `New Game` button.

## Board UI

Build the board as a custom React/CSS grid.

Do not use a canvas for Task 01.

Do not use Three.js for Task 01.

Do not use a third-party chessboard component for Task 01 unless the repo already has one and using it is clearly lower-risk than a CSS grid.

The board should use:

```css
display: grid;
grid-template-columns: repeat(8, 1fr);
grid-template-rows: repeat(8, 1fr);
```

Squares should know their algebraic coordinate:

```text
a8 b8 c8 d8 e8 f8 g8 h8
a7 b7 c7 d7 e7 f7 g7 h7
...
a1 b1 c1 d1 e1 f1 g1 h1
```

Use Unicode chess glyphs or simple text labels for this task.

Acceptable glyphs:

```text
White: ♔ ♕ ♖ ♗ ♘ ♙
Black: ♚ ♛ ♜ ♝ ♞ ♟
```

The visuals should be clean and readable. Final art is not required.

## State Management

Keep state simple.

Recommended state:

```js
const [game, setGame] = useState(() => new Chess());
const [selectedSquare, setSelectedSquare] = useState(null);
const [legalMoves, setLegalMoves] = useState([]);
const [statusText, setStatusText] = useState("White to move");
const [lastMove, setLastMove] = useState(null);
```

Important state rule:

`chess.js` should be the gameplay source of truth.

Do not maintain a separate board array that can drift from the chess engine.

When a move is made:

1. Clone or recreate the chess state safely.
2. Apply the move through `chess.js`.
3. Store the updated game object.
4. Derive the board UI from the updated game state.

## Human Input

Use click-to-select and click-to-move.

Required behavior:

1. If the player clicks a White piece while it is White's turn, select it.
2. Show legal moves for that piece.
3. If the player clicks a legal destination, make the move.
4. If the player clicks another White piece, change selection.
5. If the player clicks an invalid square, clear selection.
6. Do not allow moving Black pieces manually.
7. Do not allow any human input while Black is thinking.

Use `game.moves({ square, verbose: true })` or equivalent to get legal destinations for the selected piece.

## Computer Opponent

Create:

```text
src/chess/selectComputerMove.js
```

The function should accept the current `Chess` instance and return one legal move for Black.

Use `game.moves({ verbose: true })`.

Piece values:

```js
export const PIECE_VALUES = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 1000,
};
```

Scoring:

- Non-capture move: `0`
- Capture move: value of captured piece
- Promotion to Queen is allowed and should be selected as Queen promotion
- If multiple moves tie for the best score, choose randomly from the tied best moves
- If no captures exist, choose a random legal move

Do not add:

- Minimax
- Alpha-beta pruning
- Opening books
- Difficulty levels
- Personality settings
- Material safety analysis
- Positional scoring
- Cloud AI
- Stockfish

This should be a greedy capture-priority opponent only.

## Game Flow

Use this basic flow:

```text
White selects piece
White selects destination
Validate/make White move
Update UI
If game over, stop
Set status to Black thinking...
Wait a short moment
Computer selects move
Computer makes move
Update UI
If game over, stop
Return status to White to move
```

A short timeout for the computer move is acceptable, such as `300ms`, only to make the turn change understandable.

Do not create async complexity beyond that.

## Rules Coverage

Because this is using `chess.js`, the prototype should support normal chess legality, including:

- Legal piece movement
- Captures
- Check
- Checkmate
- Stalemate
- Draw detection if exposed by the library
- Castling
- En passant
- Pawn promotion

For this prototype, promotion may be simplified:

- Human pawns always promote to Queen.
- Computer pawns always promote to Queen.

Do not build a promotion picker in Task 01.

## UI Requirements

Add a simple side panel or top panel showing:

- Current turn/status
- Check/checkmate/stalemate/draw state
- Last move
- Move history in SAN notation if easy to derive from `chess.js`
- New Game button

Suggested status examples:

```text
White to move
Black thinking...
White is in check
Black is in check
Checkmate — White wins
Checkmate — Black wins
Stalemate
Draw
```

Keep the UI intentionally minimal.

## Styling Direction

Use plain CSS.

Do not add Tailwind unless the existing project already uses it.

Visual direction:

- Readable board
- Clear contrast
- Large pieces
- Selected-square highlight
- Legal-move highlight
- Capture highlight
- Last-move highlight
- Calm, prototype-friendly layout

Avoid building a fancy theme system in this task.

## Testing Requirements

Add Vitest tests for the custom logic.

Required test file:

```text
src/tests/selectComputerMove.test.js
```

At minimum test:

1. Computer returns a legal move.
2. Computer prefers capturing a Queen over a Pawn.
3. Computer chooses from tied best captures without crashing.
4. Computer returns a quiet legal move when no captures exist.
5. Computer promotes to Queen when a promotion move is selected.

Add a smoke test if the project is already set up for React component testing:

```text
src/tests/chessPrototypeSmoke.test.jsx
```

At minimum test:

1. App renders without crashing.
2. Board has 64 squares.
3. New Game button exists.
4. Status text appears.

## Manual Test Checklist

Create:

```text
docs/20260430_Chessish_Task_01_React_Manual_Test_Checklist.md
```

Manual checklist:

1. App starts with no console errors.
2. Board renders as 8x8.
3. White is at the bottom.
4. White moves first.
5. Clicking a White piece highlights legal moves.
6. Clicking a highlighted square moves the piece.
7. Clicking an invalid square clears selection.
8. Black pieces cannot be moved by the human.
9. Pawns move correctly.
10. Knights jump correctly.
11. Bishops move diagonally and cannot pass through pieces.
12. Rooks move orthogonally and cannot pass through pieces.
13. Queens combine rook and bishop movement.
14. Kings move legally.
15. Captures remove pieces.
16. Check state appears.
17. Checkmate state appears if reached.
18. Stalemate/draw state appears if reached.
19. Computer moves after the human move.
20. Computer prioritizes higher-value captures.
21. Pawn promotion becomes Queen.
22. New Game resets the board.

## Acceptance Criteria

This task is complete when:

- The app runs locally with Vite.
- A playable human-vs-computer chess prototype exists.
- The player controls White.
- The computer controls Black.
- Legal chess moves are enforced through `chess.js`.
- The computer makes valid moves.
- The computer prioritizes higher-value captures.
- Captures work.
- Check/checkmate/stalemate/draw status works if exposed by the library.
- Pawn promotion promotes to Queen.
- The UI has clear turn/status text.
- The board is readable and responsive enough for desktop browser testing.
- The project builds with no errors.
- The tests pass.
- There are no console errors during normal play.
- The implementation is simple and easy to extend.

## Non-Goals

Do not implement:

- Multiplayer
- Online play
- Accounts
- Login
- Save/load
- Chess clocks
- Difficulty settings
- Stockfish
- Minimax
- Alpha-beta pruning
- Opening books
- Lessons
- Puzzles
- Analysis mode
- Drag-and-drop
- Mobile polish
- Sound
- Animation polish
- Battle Chess-style combat animations
- 3D board
- Theme editor
- Skins
- Final art

## Historical / Library Research Notes For Codex

These are references for orientation only. They should not expand the scope.

- Sargon shows that a simple computer opponent can still define the core experience. Its early versions were constrained and direct, which matches this prototype's greedy-opponent target.
- Chessmaster suggests the value of approachability: clean presentation, status clarity, and easy local play matter more than raw engine strength for this task.
- Battle Chess suggests future visual personality, but only after the core board and move loop are reliable.
- `chess.js` is appropriate because it handles chess legality and game-state rules while leaving AI decisions to us.
- Vite is appropriate because this should be a fast React prototype with simple local development and production build commands.

## Suggested Commands To Verify

```bash
npm run dev
npm run build
npm run test
```

If `npm run test` does not exist yet, add it to `package.json`:

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

## Final Report Back To Dela

When finished, report:

1. What files were created or changed.
2. How to run the app.
3. How to play the prototype.
4. Which library is responsible for chess legality.
5. How the computer opponent chooses moves.
6. What tests were added.
7. Any known limitations or TODOs.
