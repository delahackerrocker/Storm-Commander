# 20260519_Storm_Commander_Task_05_Random_Encounter_Alpha

## Agent Thinking Level

High. This is the first task that moves Storm Commander from “chess visual variant” toward its actual game identity.

Think carefully about architecture, but keep the implementation intentionally small. This is not the time to build the whole roguelike campaign system.

## Safety / Repo Rule

Before making changes, check git status.

If there are uncommitted local changes, stop and ask Dela before proceeding.

Do not remove or weaken Standard Chess.

Do not remove `chess.js`.

Do not modify UnitySource in this task.

Work in ReactSource only unless there is a clear documentation-only reason to touch the repo root.

## Goal

Create the first playable Storm Commander random encounter alpha.

Storm Commander is a roguelike space adventure where the player commands the Pirate faction through story beats and tactical scenarios.

A scenario is a chess-like tactical encounter using chess-piece movement as the core movement language, but Storm Commander is not required to remain legal chess.

For this task, build a small random encounter system inside the existing React Storm Commander mode.

The alpha should answer one question:

Can a small, random, objective-driven, chess-like space battle feel fun?

## Current Project Context

The project currently has:

1. Standard Chess.
2. Storm Commander.
3. Shared chess gameplay through `BasicChessPage`.
4. `chess.js` as the real-chess legality engine.
5. Local Storm Commander PNG/faction assets.
6. Separate Standard Chess and Storm Commander styling.
7. Scenario/puzzle JSON support for regular chess-style positions.

Important:

Standard Chess should remain the orthodox chess test/control mode.

Storm Commander may begin diverging from real chess, but Standard Chess must not be polluted by Storm Commander rules.

Keep `chess.js` in the project. It may be useful later as a baseline/regression oracle for real chess.

## Product Direction

Storm Commander is becoming:

- A roguelike space adventure.
- The player is always the Pirate faction.
- Other factions are opponents and may also fight each other.
- Scenarios can include 2, 3, or 4 factions.
- Scenario boards may vary in size to represent different tactical circumstances.
- Scenarios have objectives beyond checkmate.
- Story beats happen between battles.
- Anime-inspired comm/cockpit panels give pieces character when selected.

For now, factions are visual and narrative only.

Do not implement faction-specific mechanics yet.

## Important Alpha Simplification

Do not build the full campaign system in this task.

Do not build armada persistence yet.

Do not build ship acquisition/loss persistence yet.

Do not build named individual pilots yet.

Do not build deep AI.

Do not build a story engine.

This task is the first tactical toy.

## Required Result

Add a Storm Commander-only random encounter mode that can be launched from the existing Storm Commander experience.

The player should be able to generate and play a random Storm Commander encounter with:

1. Variable board size.
2. Pirate player faction.
3. One or more enemy factions.
4. Randomly placed pieces.
5. Simple objective.
6. Simple enemy AI.
7. Selected-piece cockpit/pilot panel.
8. Movement hint text.
9. Clear win/loss objective status.

## Standard Chess Boundary

Standard Chess must continue to behave as real chess.

Standard Chess should continue to use `chess.js`.

Storm Commander random encounters may use a new tactical model instead of `chess.js` if necessary.

If implementing custom Storm Commander move logic, keep it separate from Standard Chess.

Recommended direction:

```text
src/storm-commander/
  encounter/
  tactics/
  pilots/
  objectives/
```

or a similar clean structure.

Do not bury Storm Commander-specific random encounter rules inside Standard Chess components.

## Board Requirements

Storm Commander encounters should support variable board sizes.

For this task, support at least:

```text
5x5
6x6
7x7
8x8
```

The board does not need to support every possible rectangle yet, but the data model should not assume the board is always 8x8.

The UI should render correctly for the generated board size.

The board should still feel chess-like.

## Factions

The player is always:

```text
Pirate
```

Enemy factions can be selected randomly from the existing non-Pirate faction set:

```text
Imperial
Robocorp
Rebel
```

For this alpha, generate encounters with 2 to 4 total factions:

```text
Pirate vs 1 enemy
Pirate vs 2 enemies
Pirate vs 3 enemies
```

Enemy factions may fight/capture each other if the tactical model supports it cleanly.

If that becomes too large, support Pirate vs multiple enemy factions visually, but allow the enemy AI to treat all non-Pirate factions as hostile.

Do not add faction abilities yet.

## Piece Identity

Preserve chess piece identity for now.

Use:

```text
Pawn
Bishop
Knight
Rook
Queen
King, optional
```

Do not rename pieces into ship classes yet.

Storm Commander may visually present them as ships, but mechanically they should still correspond to chess piece types.

## Piece Values / Encounter Budget

Use this Storm Commander value table:

```text
Pawn = 1
Bishop = 2
Knight = 2
Rook = 2
Queen = 4
King = optional / do not rely on king for objective resolution yet
```

For this task, use these values for random encounter budget generation.

Suggested initial budgets:

```text
Small encounter: Pirate budget 5-7, enemy total budget 5-8
Medium encounter: Pirate budget 8-10, enemy total budget 8-12
Chaotic encounter: Pirate budget 8-12, enemy total budget 12-16 split across 2-3 enemy factions
```

Keep it simple. These numbers can be tuned later.

## Pawn Movement Adjustment

Because Storm Commander pieces are randomly placed, normal chess pawn movement may be too position-dependent.

For Storm Commander random encounters only, test this pawn movement:

- Pawn may move one square forward or backward.
- Pawn may capture diagonally forward or diagonally backward.
- Pawn may not move sideways.
- Pawn may not move two squares.
- Pawn promotion is not required in this random encounter task.

Define “forward/backward” in a simple, consistent way relative to board coordinates.

Do not modify Standard Chess pawn behavior.

## Other Piece Movement

For this alpha:

- Bishop moves diagonally until blocked.
- Rook moves orthogonally until blocked.
- Queen combines rook and bishop movement.
- Knight moves in L-shapes and jumps blockers.
- King is optional.

Pieces cannot move through blockers except knights.

Pieces cannot capture friendly pieces.

Pieces can capture pieces from other factions.

## Objectives

Implement a small objective system.

Support at least 3 of these 4 objective types:

```text
Destroy Target
Survive Turns
Escape To Square
Capture Value
```

Definitions:

### Destroy Target

A specific enemy piece is marked as the target. The player wins if that piece is captured.

### Survive Turns

The player wins if at least one Pirate piece remains alive after X turns.

### Escape To Square

The player wins if any Pirate piece reaches a marked extraction square.

### Capture Value

The player wins after capturing X value worth of enemy pieces.

Use clear objective text in the UI.

Examples:

```text
Destroy the Imperial Queen.
Survive 6 turns until the jump drive charges.
Move any Pirate ship to the extraction square.
Capture 5 value worth of enemy ships.
```

Do not implement complex chained objectives yet.

## Enemy AI

Use a simple AI.

The current project already has a greedy capture-priority AI for regular chess. Use that spirit, but adapt as needed for Storm Commander random encounters.

For this task, implement one enemy personality:

```text
Sloppy Aggressive
```

Behavior:

1. Generate legal moves.
2. Prefer captures.
3. Prefer higher-value captures.
4. Otherwise choose a random legal move.

If multiple enemy factions exist, they may each take a turn in simple order.

Do not implement minimax.

Do not implement deep evaluation.

Do not implement faction AI personalities yet.

Leave clear notes/TODOs for future AI personalities such as:

```text
Runner / Train Robbery
Defender
Hunter
Greedy
Coward
```

## Turn Order

Use a simple turn order.

Recommended:

```text
Pirate
Enemy faction 1
Enemy faction 2
Enemy faction 3
repeat
```

Skip eliminated factions.

If round-robin becomes too much, use:

```text
Pirate phase
Enemy phase
```

But prefer round-robin if it is clean.

## Random Encounter Generation

Create a deterministic-friendly generator where possible.

The generator should:

1. Choose board size.
2. Choose enemy faction count.
3. Choose enemy factions.
4. Create Pirate pieces within budget.
5. Create enemy pieces within budget.
6. Place all pieces randomly without overlap.
7. Select objective type.
8. Create objective data.
9. Return a complete encounter object.

The encounter object should be plain JSON-like data.

Avoid non-serializable values.

Avoid React-only state in the core encounter model.

Suggested shape:

```js
{
  id: "generated_...",
  title: "Random Pirate Raid",
  board: {
    width: 6,
    height: 6
  },
  factions: ["pirate", "imperial", "robocorp"],
  playerFaction: "pirate",
  turnOrder: ["pirate", "imperial", "robocorp"],
  currentFaction: "pirate",
  objective: {
    type: "surviveTurns",
    turnsRequired: 6,
    turnsElapsed: 0
  },
  pieces: [
    {
      id: "pirate_rook_1",
      faction: "pirate",
      type: "r",
      square: { x: 1, y: 4 }
    }
  ],
  capturedValueByPlayer: 0,
  status: "active"
}
```

Exact shape can differ, but keep it plain, readable, and portable.

## Cockpit / Pilot Panel

Add a selected-piece panel for Storm Commander random encounters.

When the player selects a Pirate piece, show:

1. A cockpit/pilot image placeholder.
2. Faction.
3. Piece type.
4. Movement hint text.
5. A short flavor bark.

For this task, use piece-type-level pilots, not individual named pilots.

Example:

```text
Pirate Rook
Moves in straight lines until blocked.

“Point me at something expensive.”
```

Suggested pilot types:

```text
Pirate Pawn Pilot
Pirate Bishop Pilot
Pirate Knight Pilot
Pirate Rook Pilot
Pirate Queen Pilot
```

Use placeholders if no final art exists.

Pilot/cockpit images may be simple local placeholder assets.

Do not fetch remote images.

Do not require network access at runtime.

If generating placeholders with local scripts, keep paths stable and document them.

Suggested path:

```text
public/assets/storm-commander/pilots/pirate/
```

or under the existing Storm Commander asset path:

```text
public/assets/chess/storm-commander/pilots/pirate/
```

## Movement Hint Text

Add a small movement hint system.

Example hints:

```text
Pawn:
Moves one square forward or backward. Captures diagonally forward or backward.

Bishop:
Moves diagonally until blocked.

Knight:
Jumps in an L-shape.

Rook:
Moves in straight lines until blocked.

Queen:
Moves in any straight or diagonal line until blocked.
```

Show the hint when selecting the piece.

## Story Spice

Add a very small anime comms-style encounter intro.

For this task, this can be procedural text.

Examples:

```text
“Commander, Imperial signatures just dropped out of slipspace.”
“Robocorp is already here. Looks like they want the cargo too.”
“Rebel transponder detected. This raid just got crowded.”
```

Show it in the Storm Commander encounter UI.

Do not build a full branching story system.

Do not build between-battle campaign choices yet.

## UI Requirements

In Storm Commander, add a clear way to start/generate a random encounter.

Possible UI:

```text
New Random Encounter
```

When clicked:

- Generate a new random encounter.
- Replace the current Storm Commander board with the encounter board.
- Show objective text.
- Show faction/turn status.
- Show selected-piece cockpit panel when a piece is selected.

The existing Standard Chess UI should not be damaged.

If keeping old scenario controls visible in Storm Commander becomes confusing, it is acceptable to hide the old chess scenario panel in Storm Commander random encounter mode, but do not remove it globally unless necessary.

## Styling

Use Storm Commander styling only.

Do not add Storm Commander encounter styling to Standard Chess CSS.

Do not put tactical encounter styles in global `styles.css` unless they are truly global shell styles.

Use `.storm-commander-root` scoping.

## Tests

Add tests where practical.

At minimum, add pure logic tests for:

1. Random encounter generator returns a board with valid dimensions.
2. Generated pieces are placed inside the board.
3. Generated pieces do not overlap.
4. Player faction is always Pirate.
5. Enemy factions do not include Pirate.
6. Generated encounter has an objective.
7. Pawn movement supports forward/backward movement.
8. Pawn movement does not affect Standard Chess.
9. Sloppy Aggressive AI prefers higher-value captures when available.
10. Objective completion works for at least one objective type.

Suggested test files:

```text
src/tests/stormCommanderEncounterGenerator.test.js
src/tests/stormCommanderMovement.test.js
src/tests/stormCommanderObjectives.test.js
src/tests/stormCommanderAi.test.js
```

If component tests are practical, add one test verifying:

- New Random Encounter appears in Storm Commander.
- Clicking it renders an objective.
- Selecting a Pirate piece renders the cockpit/pilot panel.

## Documentation

Create a short doc:

```text
ReactSource/docs/20260519_Storm_Commander_Random_Encounter_Alpha.md
```

Document:

1. Product direction.
2. Pirate player assumption.
3. Random scenario definition.
4. Board size support.
5. Piece value table.
6. Pawn movement change.
7. Objective types.
8. AI personality.
9. What is intentionally not implemented yet.
10. How this differs from Standard Chess.

## Acceptance Criteria

This task is complete when:

- Storm Commander can generate a random encounter.
- The player is always Pirate.
- The encounter can include 1-3 enemy factions.
- The board can be smaller than 8x8.
- Pieces are randomly placed.
- Pieces can be selected.
- Legal moves are shown.
- Player can move and capture.
- Enemy AI can respond.
- At least 3 objective types exist.
- Objective status is visible.
- Win/loss state can be reached through objectives.
- Selected Pirate pieces show a cockpit/pilot panel with movement hint text.
- Standard Chess still works.
- `chess.js` remains in the project.
- Standard Chess remains real chess.
- Tests pass.
- Build passes.
- No console errors during normal play.

## Non-Goals

Do not implement:

- Full roguelike campaign map
- Armada persistence
- Ship acquisition persistence
- Ship loss persistence
- Named individual pilots
- Pilot leveling
- Faction mechanics
- Deep AI
- Minimax
- Stockfish
- Network play
- Save/load
- Unity implementation
- Final pilot art
- Final ship art
- Full story system
- Famous chess puzzle import expansion
- Full 3D presentation
- Audio

## Final Report Back To Dela

When finished, report:

1. What files were created or changed.
2. How to run the React app.
3. How to open Storm Commander.
4. How to generate a random encounter.
5. What board sizes are supported.
6. What objective types were implemented.
7. How pawn movement differs in Storm Commander.
8. How enemy AI chooses moves.
9. How the cockpit/pilot panel works.
10. What tests were added.
11. Whether Standard Chess still uses `chess.js`.
12. Any known limitations or TODOs.
