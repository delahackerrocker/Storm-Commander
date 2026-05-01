# 20260430_Chessish_Task_01_Basic_Chess_Setup

## Agent Thinking Level

Medium-high. This is a core gameplay foundation task. Keep the implementation simple, readable, and easy to extend, but do not hand-wave the chess rules.

## Safety / Repo Rule

Before making changes, check git status. If there are uncommitted local changes, stop and ask Dela before proceeding.

## Goal

Set up the first playable vertical slice of the Chess-ish game: a local human player versus a basic computer opponent.

The computer opponent does not need to be smart. It only needs to:
1. Understand how each chess piece is allowed to move.
2. Choose a valid move on its turn.
3. Prefer capturing higher-value enemy pieces when captures are available.

This task is about establishing the core chess gameplay loop, not polish.

## Assumptions

- Use Unity 6.3 LTS.
- Use C#.
- Put new game code and assets under `Assets/GR1M01RE`.
- Keep the feature set minimal.
- Do not add optional toggles, speculative systems, networking, save/load, menus, difficulty settings, or advanced AI.
- Do not use an external chess engine.
- Placeholder visuals are fine.

## Required Player Experience

When the scene runs:

1. The player sees an 8x8 chess board.
2. The player controls White.
3. The computer controls Black.
4. White moves first.
5. The player can select a white piece, see its valid destination squares, and click a destination to move.
6. Captures remove the captured piece from the board.
7. After the human move completes, the computer automatically makes one valid black move.
8. Turns alternate until a king is captured or a basic checkmate/stalemate condition is detected.
9. The game clearly displays whose turn it is and when the game is over.

## Scope for Chess Rules

Implement normal movement for:

- Pawn
- Knight
- Bishop
- Rook
- Queen
- King

Required movement behavior:

- Pieces cannot move through occupied squares, except knights.
- Pieces cannot move onto a square occupied by a friendly piece.
- Pieces can capture enemy pieces.
- Pawns move forward one square.
- Pawns may move forward two squares from their starting rank if unobstructed.
- Pawns capture diagonally.
- Pawns promote to Queen when reaching the final rank.

For this first task, advanced rules may be omitted:

- Castling is not required.
- En passant is not required.
- Draw by repetition is not required.
- Fifty-move rule is not required.
- Chess clocks are not required.

Important rule expectation:

- The king should not be allowed to move into a square attacked by the opponent.
- A player should not be allowed to make a move that leaves their own king in check.
- If full checkmate/stalemate detection becomes too large for this first task, implement king-capture as a fallback win condition and leave a clear TODO comment describing what remains.

## Simple Computer Opponent

Implement a basic move picker for Black.

The AI should:

1. Generate all valid legal moves for Black.
2. Score each move.
3. Prefer captures.
4. Prefer capturing more valuable pieces.

Use this simple piece value table:

```csharp
Pawn = 1
Knight = 3
Bishop = 3
Rook = 5
Queen = 9
King = 1000
```

Scoring rule:

- Non-capture move: score 0.
- Capture move: score = captured piece value.
- If multiple moves have the same best score, choose one randomly from the tied best moves.

Do not add deeper search, minimax, opening books, difficulty settings, or evaluation heuristics in this task.

## Suggested File / Class Structure

Create a simple, explicit structure. Exact names can change if the project already has conventions, but keep responsibilities clear.

Suggested folders:

```text
Assets/GR1M01RE/Scenes/
Assets/GR1M01RE/Scripts/Chess/
Assets/GR1M01RE/Prefabs/Chess/
Assets/GR1M01RE/Materials/Chess/
```

Suggested scripts:

```text
ChessGameController.cs
ChessBoard.cs
ChessSquare.cs
ChessPiece.cs
ChessMove.cs
ChessMoveGenerator.cs
ChessComputerPlayer.cs
ChessPieceType.cs
ChessPieceColor.cs
```

Suggested responsibilities:

### `ChessGameController`

- Owns the match state.
- Tracks current turn.
- Handles player selection.
- Tells the board to move pieces.
- Triggers the computer move after the human move.
- Detects game over.

### `ChessBoard`

- Stores the 8x8 board state.
- Knows which piece occupies each square.
- Provides helper methods like:
  - `IsInsideBoard`
  - `GetPieceAt`
  - `MovePiece`
  - `RemovePiece`
  - `SetupStartingPosition`

### `ChessPiece`

- Stores piece type and color.
- Stores current board coordinate.
- Updates visual position after movement.

### `ChessMove`

- Plain data object or struct.
- Contains:
  - from coordinate
  - to coordinate
  - moving piece
  - captured piece, if any
  - promotion info, if any

### `ChessMoveGenerator`

- Generates valid moves for pieces.
- Should be board-state driven.
- Should be testable without requiring visual scene logic.

### `ChessComputerPlayer`

- Receives valid moves.
- Scores moves.
- Chooses the best capture-priority move.

## Visual Setup

Use placeholder visuals.

Acceptable implementation:

- 8x8 board made of simple square sprites, planes, or quads.
- Alternating light/dark square colors.
- Pieces represented by simple 2D sprites, primitive shapes, or text labels.
- Labels may use chess letters:
  - `P`, `N`, `B`, `R`, `Q`, `K`
- White and black pieces must be visually distinguishable.

The visual setup does not need final art.

## Input

Use mouse input for this first task.

Required:

- Click a white piece to select it.
- Highlight valid destination squares.
- Click a highlighted square to move.
- Clicking elsewhere clears or changes the selection in a sensible way.

No controller support is required in this first task.

## UI

Add minimal UI text for:

- Current turn: `White to move` / `Black thinking`
- Game over state:
  - `White wins`
  - `Black wins`
  - `Draw` if stalemate is implemented

Do not build menus.

## Scene Requirement

Create or update a scene that can be opened and played immediately.

Suggested scene:

```text
Assets/GR1M01RE/Scenes/ChessPrototype.unity
```

The scene should include everything necessary to press Play and test the chess loop.

## Testing Requirements

Add basic tests if the project already has a test setup. If not, add a short manual test checklist in a markdown file.

At minimum, verify manually:

1. Board appears correctly as 8x8.
2. All pieces spawn in normal starting positions.
3. White moves first.
4. Pawns move one square forward.
5. Pawns move two squares from starting rank.
6. Pawns capture diagonally.
7. Knights jump over pieces.
8. Bishops move diagonally and cannot pass through pieces.
9. Rooks move orthogonally and cannot pass through pieces.
10. Queens combine rook and bishop movement.
11. Kings move one square.
12. Pieces cannot capture friendly pieces.
13. Captured pieces disappear.
14. Turn changes after a valid human move.
15. Computer makes a valid move after the human move.
16. Computer chooses a high-value capture over a low-value capture when both are available.
17. Pawn promotion creates a Queen.
18. Game over can be reached.

Suggested manual test file:

```text
Assets/GR1M01RE/Docs/20260430_Chessish_Task_01_Manual_Test_Checklist.md
```

## Acceptance Criteria

This task is complete when:

- A playable chess prototype scene exists.
- Human White can make valid chess moves.
- Computer Black responds with a valid move.
- Captures work.
- Pawn promotion works.
- The computer prioritizes higher-value captures.
- The game can end through king capture or checkmate if implemented.
- The project compiles with no errors.
- There are no console errors during normal play.
- The implementation is simple and readable.
- The task does not include unnecessary extra systems.

## Non-Goals

Do not implement:

- Online multiplayer
- Local two-player mode
- Menus
- Save/load
- Difficulty settings
- Minimax
- Stockfish or external chess engines
- Animation polish
- Final art
- Audio
- Controller support
- Tutorial systems
- Special chess variants

## Final Report Back To Dela

When finished, report:

1. What files were created or changed.
2. How to open and play the scene.
3. Which chess rules are implemented.
4. Which advanced chess rules were intentionally omitted.
5. How the computer opponent chooses moves.
6. Any known limitations or TODOs.
