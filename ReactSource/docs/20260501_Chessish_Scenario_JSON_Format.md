# Chess-ish Scenario JSON Format

The React prototype stores scenario data as plain JSON in `src/chess/scenarios/curatedScenarios.json`. This file is intentionally portable so a future Unity build can read the same library with a serializable C# model.

## Shape

Each scenario object uses stable, explicit fields:

```json
{
  "id": "manual_promotion_white_a8",
  "source": "manual-seed",
  "sourcePuzzleId": null,
  "originalFen": "4k3/P7/8/8/8/8/7p/4K3 w - - 0 31",
  "playableFen": "4k3/P7/8/8/8/8/7p/4K3 w - - 0 31",
  "setupMove": null,
  "solutionMoves": ["a7a8q"],
  "rating": 900,
  "ratingDeviation": null,
  "popularity": null,
  "playCount": null,
  "themes": ["endgame", "promotion", "advancedPawn"],
  "openingTags": [],
  "mode": "puzzle",
  "sideToMove": "w",
  "fullmoveNumber": 31,
  "pieceCount": 4,
  "materialSummary": {
    "white": { "pawns": 1, "knights": 0, "bishops": 0, "rooks": 0, "queens": 0, "king": 1 },
    "black": { "pawns": 1, "knights": 0, "bishops": 0, "rooks": 0, "queens": 0, "king": 1 }
  },
  "gameUrl": null,
  "notes": "Manual seed promotion puzzle."
}
```

## Unity Portability

- Missing optional values use `null`, not `undefined`.
- `themes`, `openingTags`, and `solutionMoves` are always arrays of strings.
- FEN strings are stored as source text and should not be rewritten by UI code.
- `playableFen` is the position the game should load.
- For Lichess puzzle rows, `originalFen` is loaded first, `setupMove` is applied, and the resulting FEN becomes `playableFen`.
- `solutionMoves` stays in UCI notation so it can be replayed later in JavaScript or C#.
- `materialSummary`, `pieceCount`, `sideToMove`, and `fullmoveNumber` are derived from `playableFen` for debugging and tooling.

## Import Pipeline

Use `scripts/buildPuzzleScenarios.mjs` to curate a small JSON file from a local Lichess-style CSV:

```bash
node scripts/buildPuzzleScenarios.mjs --input data/lichess_db_puzzle.csv --output src/chess/scenarios/curatedScenarios.json --limit 500
```

The full raw Lichess CSV should stay outside the committed app. Only curated JSON output belongs in the prototype.
