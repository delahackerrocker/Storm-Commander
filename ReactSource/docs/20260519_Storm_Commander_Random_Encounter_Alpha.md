# 20260519 Storm Commander Random Encounter Alpha

This task moves Storm Commander from a chess visual variant toward its own tactical identity.

## Product Direction

Storm Commander is a roguelike space adventure prototype. The player commands the Pirate faction through short tactical encounters and, later, story beats between battles.

The current alpha is intentionally small. It asks whether a random, objective-driven, chess-like space battle can feel promising before building campaign persistence, named pilots, ship acquisition, or faction mechanics.

## Pirate Player Assumption

Random encounters always make the player faction:

```text
Pirate
```

Enemy factions are selected from:

```text
Imperial
Robocorp
Rebel
```

Encounters can include Pirate vs 1, 2, or 3 enemy factions.

## Random Scenario Definition

A generated encounter is plain JSON-like state:

- Board dimensions.
- Participating factions.
- Turn order.
- Current faction.
- Objective data.
- Piece list with faction, type, and `{ x, y }` square.
- Captured value.
- Active/won/lost status.

The core model lives under `src/storm-commander/` and stays separate from Standard Chess.

## Board Size Support

Random encounters support square boards at these sizes:

```text
5x5
6x6
7x7
8x8
```

The UI renders from the encounter board dimensions instead of assuming an 8x8 board.

## Piece Value Table

Storm Commander encounter generation and capture scoring use:

```text
Pawn = 1
Bishop = 2
Knight = 2
Rook = 2
Queen = 4
King = 4
```

The King exists as a supported piece type, but objectives do not rely on checkmate or king capture.

## Pawn Movement Change

Standard Chess still uses normal `chess.js` pawn rules.

Storm Commander random encounters use adjusted pawn movement:

- Pawns move one square forward or backward.
- Pawns capture diagonally forward or backward.
- Pawns do not move sideways.
- Pawns do not move two squares.
- Pawn promotion is not part of this alpha.

## Objective Types

The alpha implements all four task objective types:

- `Destroy Target`: capture the marked enemy piece.
- `Survive Turns`: keep at least one Pirate piece alive until the turn count is met.
- `Escape To Square`: move any Pirate piece to the extraction square.
- `Capture Value`: capture enough enemy piece value.

The encounter panel shows objective text, progress, and win/loss status.

## AI Personality

Enemy factions use one personality:

```text
Sloppy Aggressive
```

Behavior:

- Generate legal moves.
- Prefer captures.
- Prefer the highest-value capture.
- Otherwise choose a random legal move.

Future AI personalities to explore:

- Runner / Train Robbery
- Defender
- Hunter
- Greedy
- Coward

## Cockpit Panel

Selecting a Pirate piece opens a cockpit/pilot panel with:

- Placeholder cockpit portrait.
- Faction.
- Piece type.
- Movement hint text.
- Piece-type flavor bark.

Pilots are currently piece-type-level placeholders, not named individual pilots.

## Difference From Standard Chess

Standard Chess remains the orthodox chess control mode:

- It still uses `chess.js`.
- It still uses the normal 8x8 chess board.
- It still uses normal chess legality.

Storm Commander random encounters use a separate tactical model under `src/storm-commander/`. This keeps custom encounter rules from leaking into Standard Chess.

## Not Implemented Yet

This alpha does not implement:

- Campaign map.
- Armada persistence.
- Ship acquisition or loss persistence.
- Named pilots.
- Pilot leveling.
- Faction-specific abilities.
- Deep AI.
- Minimax or Stockfish.
- Save/load.
- Unity implementation.
- Final pilot art.
- Final story system.
