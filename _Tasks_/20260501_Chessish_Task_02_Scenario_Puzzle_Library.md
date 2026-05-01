# 20260501_Chessish_Task_02_Scenario_Puzzle_Library

## Agent Thinking Level

High. This task adds a reusable scenario / puzzle layer on top of the React chess prototype. Keep the implementation practical, but be careful with data shape, chess-state correctness, metadata visibility, and future Unity portability.

## Safety / Repo Rule

Before making changes, check git status.

If there are uncommitted local changes, stop and ask Dela before proceeding.

## Goal

Add a local chess scenario / puzzle library system to the React chess prototype.

The app should be able to load interesting mid-game or endgame chess positions where both players may already be missing pieces. These positions should come from curated chess puzzle data using FEN strings and metadata.

When a puzzle or scenario loads, the UI must clearly show the metadata for that position so Dela knows exactly what he is looking at.

## Important Project Direction

This React app is a prototype.

The intended long-term destination is a Unity rebuild.

That means this task should treat React as the fast iteration shell, not the final architecture. The durable work should be:

1. A clean scenario data format.
2. A curated local scenario JSON file.
3. A repeatable scenario import / filtering pipeline.
4. Portable chess scenario metadata.
5. Simple pure helper functions that can later be mirrored in C#.

Do not bury the scenario system inside React-only component state in a way that makes the data hard to reuse later.

The scenario JSON should be easy for Unity to consume later through a C# serializable model.

## Context

The previous task established the basic React chess prototype:

- Human player controls White.
- Computer controls Black.
- `chess.js` is the gameplay legality source of truth.
- The custom computer opponent makes valid moves and prioritizes high-value captures.

This task builds on that prototype by adding curated mid-game / endgame positions.

## Recommended Data Source

Use the Lichess Puzzle Database format as the primary reference format.

Expected source fields:

```text
PuzzleId
FEN
Moves
Rating
RatingDeviation
Popularity
NbPlays
Themes
GameUrl
OpeningTags
```

Important: do not ship the full Lichess puzzle CSV with the app. The full dataset is much too large for a small browser prototype.

Instead:

1. Add a tiny local seed scenario JSON file for immediate development.
2. Add an importer script that can preprocess a downloaded Lichess puzzle CSV into a small curated JSON library.
3. Commit the curated JSON output only.
4. Do not commit the full raw CSV.

## Important Lichess Puzzle Format Note

In the Lichess puzzle format:

- `FEN` is the position before the opponent's setup move.
- `Moves` contains the setup move first, then the player's solution continuation.
- Moves are generally encoded as UCI strings, such as `e2e4`, `e7e8q`, etc.

For true puzzle mode, the app should:

```text
Load original FEN
Apply first move from Moves
Use the resulting position as the playable puzzle position
The next move in the Moves list is the expected player move
```

For scenario mode, the app may load a FEN directly and let the player continue the position freely.

Support both concepts in the data model, but implement the simplest usable version first.

## Required Feature Set

Add:

1. Scenario / puzzle data model.
2. Local curated scenario seed JSON.
3. Scenario loader.
4. Random scenario selection.
5. Metadata display panel.
6. Theme filtering.
7. Promotion puzzle support.
8. Node importer script for generating curated scenario JSON from a Lichess-style CSV.
9. Tests for filtering, parsing, and scenario selection.
10. Unity-portability notes in the docs.

## Required Themes

Support filtering by tactical themes.

Include these theme interests at minimum:

```text
middlegame
endgame
fork
pin
skewer
discoveredAttack
sacrifice
mate
advancedPawn
promotion
trappedPiece
deflection
attraction
clearance
intermezzo
quietMove
zugzwang
```

Important: `promotion` must be included as a first-class supported theme.

Promotion-themed puzzles should be discoverable through the same scenario selection flow as other themes.

## Scenario Data Shape

Create a normalized scenario data shape for the app.

Suggested file:

```text
src/chess/scenarios/scenarioTypes.js
```

Suggested object shape:

```js
{
  "id": "lichess_00sO1",
  "source": "lichess",
  "sourcePuzzleId": "00sO1",

  "originalFen": "1k1r4/pp3pp1/2p1p3/4b3/P3n1P1/8/KPP2PN1/3rBR1R b - - 2 31",
  "playableFen": "computed or same as originalFen depending on mode",

  "setupMove": "optional first move from source Moves",
  "solutionMoves": ["optional", "remaining", "moves"],

  "rating": 998,
  "ratingDeviation": 80,
  "popularity": 95,
  "playCount": 12345,

  "themes": ["middlegame", "discoveredAttack", "advantage"],
  "openingTags": ["optional", "opening", "labels"],

  "mode": "puzzle",
  "sideToMove": "w",
  "fullmoveNumber": 31,

  "pieceCount": 22,
  "materialSummary": {
    "white": { "pawns": 4, "knights": 1, "bishops": 1, "rooks": 2, "queens": 0, "king": 1 },
    "black": { "pawns": 5, "knights": 1, "bishops": 1, "rooks": 2, "queens": 0, "king": 1 }
  },

  "gameUrl": "https://lichess.org/...",
  "notes": ""
}
```

The exact object can differ, but it must preserve enough metadata for display, filtering, debugging, and later Unity import.

## Unity Portability Rules

Because this prototype will eventually be rebuilt in Unity:

1. Keep scenario data as plain JSON.
2. Do not rely on JavaScript-only values such as `undefined`.
3. Use explicit `null` for missing optional values.
4. Keep field names stable and readable.
5. Keep `themes` as an array of strings.
6. Keep `solutionMoves` as UCI strings.
7. Keep FEN strings unmodified.
8. Avoid derived UI-only fields in the core JSON.
9. Put derived values in metadata only if they are useful for debugging or future Unity tooling.
10. Document the JSON schema in markdown.

Create:

```text
docs/20260501_Chessish_Scenario_JSON_Format.md
```

This doc should explain how Unity can later consume the scenario library.

## Required Files

Add or update files similar to:

```text
src/chess/scenarios/
  curatedScenarios.json
  scenarioThemes.js
  scenarioFilters.js
  scenarioLoader.js
  scenarioMetadata.js

src/components/
  ScenarioPanel.jsx
  ScenarioMetadataPanel.jsx
  ScenarioControls.jsx

scripts/
  buildPuzzleScenarios.mjs

docs/
  20260501_Chessish_Task_02_Scenario_Puzzle_Manual_Test_Checklist.md
  20260501_Chessish_Scenario_JSON_Format.md
```

Use the existing project structure if it already differs, but keep responsibilities separated.

## Local Seed Scenario Library

Create a small curated local file:

```text
src/chess/scenarios/curatedScenarios.json
```

Requirements:

- Include at least 12 development scenarios.
- Include at least 2 promotion-themed scenarios.
- Include at least 2 endgame scenarios.
- Include at least 2 middlegame tactical scenarios.
- Include at least 2 mate-themed scenarios.
- Every scenario must have valid FEN.
- Every scenario must load cleanly through `chess.js`.
- Every scenario must include metadata fields, even if some values are null or `"manual-seed"`.

If real Lichess rows are not immediately available in the repo, Codex may create manual seed scenarios, but they must still be valid chess positions and clearly marked:

```js
source: "manual-seed"
```

Do not fabricate Lichess IDs or URLs for manual scenarios.

Manual scenarios should use:

```js
sourcePuzzleId: null
gameUrl: null
```

## Scenario Importer Script

Create:

```text
scripts/buildPuzzleScenarios.mjs
```

The script should accept a local CSV input path and output a smaller curated JSON file.

Suggested command:

```bash
node scripts/buildPuzzleScenarios.mjs \
  --input data/lichess_db_puzzle.csv \
  --output src/chess/scenarios/curatedScenarios.json \
  --limit 500 \
  --minRating 800 \
  --maxRating 1800 \
  --minPopularity 70 \
  --minFullmove 15 \
  --maxPieceCount 28
```

The script should:

1. Read the CSV as a stream.
2. Parse Lichess-style puzzle rows.
3. Validate FEN with `chess.js`.
4. Apply the first source move to compute `playableFen` for puzzle mode.
5. Reject rows that do not parse.
6. Reject rows outside rating / popularity range.
7. Reject rows without desired themes.
8. Include `promotion` puzzles when they match the filters.
9. Compute piece count.
10. Compute material summary.
11. Compute side to move.
12. Compute fullmove number.
13. Preserve metadata.
14. Stop after the requested limit.
15. Write pretty JSON.

Do not add heavy CSV dependencies unless necessary. Prefer a simple streaming Node script. If a dependency is used, keep it minimal and explain why.

## Curation Defaults

Use these default filters unless Dela changes them:

```text
Rating range: 800-1800
Minimum popularity: 70
Minimum fullmove number: 15
Maximum piece count: 28
Preferred modes: puzzle and scenario
Preferred themes:
  middlegame
  endgame
  fork
  pin
  skewer
  discoveredAttack
  sacrifice
  mate
  advancedPawn
  promotion
  trappedPiece
```

Reasoning:

- Rating 800-1800 gives understandable but interesting positions.
- Fullmove 15+ avoids opening positions.
- Max piece count 28 increases the chance that pieces are already missing.
- Theme filtering avoids bland random positions.
- Promotion positions are specifically useful because they create dramatic late-game choices.

## Metadata Display Panel

Create a visible metadata panel that appears whenever a scenario / puzzle is loaded.

Suggested component:

```text
src/components/ScenarioMetadataPanel.jsx
```

Display at minimum:

```text
Title / Scenario ID
Source
Source Puzzle ID
Mode: Puzzle or Scenario
Rating
Rating Deviation
Popularity
Number of Plays
Themes
Opening Tags
Side to Move
Fullmove Number
Piece Count
Material Summary
Original FEN
Playable FEN
Game URL, if present
Notes
```

For solution data:

- Do not show the solution moves by default.
- Add a small `Reveal Solution` button or collapsed `<details>` section.
- This allows Dela to inspect the complete metadata without accidentally spoiling every puzzle immediately.

The metadata panel is important. It is not optional.

## Scenario Controls

Add simple controls:

```text
New Random Scenario
New Random Puzzle
Theme Filter
Rating Range Display
Reveal Solution
Copy FEN
Reset Current Scenario
Continue Position
```

Keep the UI simple.

Do not build a full editor.

For Task 02, a basic dropdown / multi-select for theme filtering is acceptable.

If multi-select is too much for this pass, use a single theme dropdown with options like:

```text
Any Theme
Middlegame
Endgame
Mate
Fork
Pin
Sacrifice
Advanced Pawn
Promotion
```

## Game Mode Behavior

Support two basic modes.

### Scenario Mode

- Load `playableFen`.
- Let the human play freely from the position.
- Computer responds using the existing greedy capture-priority AI.
- This is the simplest mode and should work first.

### Puzzle Mode

- Load `playableFen`.
- Track the expected player solution line if `solutionMoves` exists.
- For Task 02, it is acceptable to only display the solution metadata and not yet enforce exact puzzle correctness.
- If enforcement is quick and safe, implement:
  - correct move feedback
  - incorrect move feedback
  - auto-play opponent replies from the solution line

Do not let puzzle enforcement delay the scenario library foundation.

## Integration With Existing Chess Prototype

Update the chess app so that:

1. New game from standard starting position still works.
2. Scenario / puzzle loading does not break normal play.
3. Board state comes from `chess.js`.
4. Loading a scenario replaces the current `Chess` state with the selected FEN.
5. Computer move logic still works from loaded positions.
6. Human legal move highlighting works from loaded positions.
7. Status text updates correctly after loading a scenario.

## Promotion Requirements

Promotion support must be verified in two ways.

### Existing Gameplay Promotion

- Human pawn promotion still promotes to Queen.
- Computer pawn promotion still promotes to Queen.

### Scenario Library Promotion

- At least 2 seed scenarios include the `promotion` theme.
- The theme filter can select promotion scenarios.
- Metadata panel displays `promotion` in the theme list.
- Promotion positions load without errors.
- A promotion scenario can be played from the loaded state.

## Testing Requirements

Add or update tests.

Required tests:

```text
src/tests/scenarioFilters.test.js
src/tests/scenarioLoader.test.js
src/tests/scenarioMetadata.test.js
```

At minimum test:

1. Curated scenarios load as valid JSON.
2. Every curated scenario has valid FEN.
3. Every curated scenario has required metadata fields.
4. Theme filtering returns only matching scenarios.
5. Promotion theme filtering returns promotion scenarios.
6. Piece count is computed correctly from FEN.
7. Fullmove number is computed correctly from FEN.
8. Material summary is computed correctly from FEN.
9. Scenario loader can load a scenario into `chess.js`.
10. Existing computer move selector can return a legal move from a loaded scenario.
11. No curated scenario uses `undefined` or non-JSON-safe values.

If importer script is testable without too much overhead, add one small fixture CSV and test:

```text
src/tests/fixtures/lichessPuzzleFixture.csv
```

Importer fixture test should verify:

1. Lichess row parses.
2. First setup move is applied for puzzle mode.
3. `playableFen` differs from `originalFen` when a setup move exists.
4. Metadata is preserved.
5. Promotion-themed row is preserved when requested.

## Manual Test Checklist

Create:

```text
docs/20260501_Chessish_Task_02_Scenario_Puzzle_Manual_Test_Checklist.md
```

Include:

1. App starts with no console errors.
2. Standard new game still works.
3. New Random Scenario loads a non-starting FEN.
4. Loaded board shows missing pieces when the FEN contains missing pieces.
5. Metadata panel appears after scenario load.
6. Metadata panel shows ID, source, rating, popularity, themes, FEN, piece count, material summary, and side to move.
7. Copy FEN works.
8. Theme filter works.
9. Promotion filter finds promotion scenarios.
10. Promotion scenario loads.
11. Human can move from a loaded scenario.
12. Computer responds from a loaded scenario.
13. Captures still work from a loaded scenario.
14. Reset Current Scenario returns to the loaded FEN.
15. New Game returns to the standard chess starting position.
16. Reveal Solution does not show by default.
17. Reveal Solution shows solution moves when available.
18. Scenario JSON format doc exists.
19. Scenario JSON format doc explains future Unity consumption.

## Acceptance Criteria

This task is complete when:

- The React chess prototype has a working scenario / puzzle library.
- At least 12 local seed scenarios exist.
- At least 2 local seed scenarios have the `promotion` theme.
- Scenario loading uses FEN.
- Scenario loading works with `chess.js`.
- Scenario metadata displays clearly in the UI.
- Theme filtering works.
- Promotion filtering works.
- The existing greedy computer opponent can move from loaded scenarios.
- Standard new game still works.
- The scenario JSON is portable and Unity-friendly.
- The scenario JSON format is documented.
- Tests pass.
- The app builds with no errors.
- The full raw Lichess dataset is not committed.
- The implementation remains simple and understandable.

## Non-Goals

Do not implement:

- Full puzzle training platform
- User accounts
- Online play
- Save files
- Cloud sync
- Stockfish
- Minimax
- Puzzle rating progression
- Daily puzzle system
- Achievements
- Chess clock
- Mobile polish
- Sound
- Animation polish
- 3D board
- Theme editor
- Unity implementation in this task

## Notes For Future Unity Rebuild

This task should leave behind a JSON scenario library that can later be read by Unity.

Future Unity shape may look roughly like:

```csharp
[Serializable]
public class ChessScenario
{
    public string id;
    public string source;
    public string sourcePuzzleId;
    public string originalFen;
    public string playableFen;
    public string setupMove;
    public string[] solutionMoves;
    public int rating;
    public int ratingDeviation;
    public int popularity;
    public int playCount;
    public string[] themes;
    public string[] openingTags;
    public string mode;
    public string sideToMove;
    public int fullmoveNumber;
    public int pieceCount;
    public MaterialSummary materialSummary;
    public string gameUrl;
    public string notes;
}
```

Do not implement this Unity code now. This is only to keep the JSON design sane.

## Suggested Commands To Verify

```bash
npm run dev
npm run build
npm run test
```

If importer script is added:

```bash
node scripts/buildPuzzleScenarios.mjs --help
```

## Final Report Back To Dela

When finished, report:

1. What files were created or changed.
2. How to run the app.
3. How to load a random scenario.
4. How to filter by theme, especially `promotion`.
5. What metadata appears when a scenario loads.
6. How many seed scenarios were added.
7. How many promotion scenarios were added.
8. How the importer script works.
9. How the scenario JSON is designed to remain portable for Unity.
10. Any known limitations or TODOs.
