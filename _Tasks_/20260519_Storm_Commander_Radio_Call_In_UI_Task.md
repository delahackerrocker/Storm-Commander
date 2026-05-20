# 20260519 — Storm Commander Radio Call-In UI Task

## Destination

Save this task in the repo at:

`_Tasks_/20260519_Storm_Commander_Radio_Call_In_UI_Task.md`

## Task Summary

Build the first browser-visible version of the **scenario-start radio call-in UX** for Storm Commander.

When a scenario starts, each player-controlled piece calls in over radio. Higher-ranking pieces go first. The currently speaking piece receives a soft selection highlight on the board, and its matching unit panel highlights at the same time. The unit panel shows a portrait placeholder, a name/callsign placeholder, and an icon representing that unit’s movement pattern.

This is a UX/worldbuilding pass, not a character system.

## Non-Negotiable Browser Visibility Requirement

This work must be visible in a browser throughout the process.

Codex must not treat this as a headless logic-only task. The final result must be demonstrable by opening the project in a browser and watching the radio call-in sequence run.

Before making changes:

1. Inspect the repo and identify the existing app start command.
2. Run the app locally.
3. Confirm the current browser route/page where the board/scenario UI can be viewed.
4. If the current project does not yet have a clean scenario route, create the smallest appropriate demo path/state inside the existing app structure so this feature can be seen in-browser.

During implementation:

- Keep the app runnable after each meaningful change.
- Do not leave the feature hidden behind unavailable data, missing art, or an unconnected component.
- Do not implement systems that cannot be visually confirmed in the browser.
- Prefer obvious placeholder UI over invisible “future-ready” architecture.

Final Codex response must include:

- The local browser URL or route used to verify the feature.
- Exact steps for Dela to see the radio call-in sequence.
- A short list of changed files.
- Confirmation that the project builds/runs.
- Notes about any visual limitations caused by existing project state.

## Core Feature Requirements

At scenario start:

1. The radio call-in sequence begins before normal player control.
2. Each player-controlled piece calls in once.
3. Pieces call in by rank, highest-ranking first.
4. The currently speaking piece receives a soft selection/highlight on the board.
5. The matching unit panel/card receives a synchronized highlight.
6. The speaking unit’s panel/card shows:
   - portrait placeholder
   - name or callsign placeholder
   - movement-pattern icon
   - short radio text line
7. When all player pieces have called in, the scenario proceeds to the normal playable state.

## Strict Scope Boundaries

Do **not** add these features in this task:

- Skip button.
- Settings menu.
- Full/minimal comms mode.
- Enemy radio chatter.
- Strategic hints.
- Puzzle hints.
- Character memory.
- Unit relationship systems.
- Injured/missing/corrupted comms.
- Unique character abilities.
- Persistent identities.
- Actual character art production.
- Complex procedural dialogue system.
- Voice-over or audio system work unless there is already a trivial existing hook.

Keep this implementation focused on the exact UX described above.

## Placeholder Art Direction

Do not spend effort on character art.

Use clear named placeholders:

- Portrait placeholder boxes.
- Simple initials.
- Silhouette blocks.
- Unit-type labels.
- Callsign labels.
- Basic movement glyphs/icons.

The goal is UI shape, pacing, readability, and faction-colored context.

## Faction Color Requirement

Tint the radio/chat windows and appropriate UI elements using the relevant faction color for the current context.

If the existing project already has faction color data:

- Use it.
- Keep the implementation aligned with the existing data model.

If faction color data does not exist yet:

- Add the smallest local placeholder structure needed for this demo.
- Name it clearly.
- Do not build a large faction system.
- Do not over-abstract.

Example placeholder colors are acceptable as long as they are clearly labeled and easy to replace later.

## UX Direction

The sequence should feel like a tactical radio check before a mission.

The tone should be clean, readable, and game-like:

- soft board highlight
- synchronized panel highlight
- compact radio text
- clear movement icon
- faction-tinted comms window/panel
- no clutter
- no long dialogue

The radio call-in should help the player understand:

- where each unit is on the board
- which unit panel belongs to it
- what movement pattern it uses
- which faction/context it belongs to

## Suggested Unit Rank Order

Use the project’s existing unit hierarchy if one already exists.

If no hierarchy exists, use this simple default order:

1. King / Commander
2. Queen
3. Rook
4. Bishop
5. Knight
6. Pawn

If the current game does not use literal chess names, map the existing unit types to their movement/rank equivalents as simply as possible.

## Suggested Placeholder Call-In Lines

Use short lines like these as temporary content:

- Commander: “Commander online.”
- Queen: “Queen online. All lanes open.”
- Rook: “Rook ready. Straight-line pattern confirmed.”
- Bishop: “Bishop set. Diagonal pattern confirmed.”
- Knight: “Knight mounted. Jump pattern confirmed.”
- Pawn: “Pawn ready. Advancing.”

These are placeholders. Prioritize timing, layout, highlighting, and readability over writing.

## Movement Pattern Icons

Use simple visual icons or glyphs for now.

Examples:

- Rook: cross / vertical-horizontal arrows
- Bishop: diagonal X arrows
- Knight: L-shape
- Queen: combined cross + diagonal
- Pawn: forward arrow
- King/Commander: one-step radial marker

These can be CSS/SVG/text placeholders. Do not hunt for art assets.

## Implementation Notes

Codex should inspect the project first and follow the existing architecture.

Likely implementation shape:

- A small data structure describing the units participating in the current scenario.
- A scenario intro state such as `radioIntro`, `activeCallInIndex`, or equivalent.
- A sorted list of player units by rank.
- A visual highlight state passed to both board piece rendering and unit panel rendering.
- A compact radio call-in component or panel.
- A timed progression from one unit to the next.
- A transition into the normal playable scenario state after the final call-in.

Use the project’s existing naming, component style, CSS conventions, and state management approach.

## Timing Guidance

Keep the timing brisk.

Suggested default:

- Each unit call-in is visible for roughly 1.0–1.5 seconds.
- Soft highlight fades or pulses subtly.
- The whole sequence should feel like a fast roll call, not a cutscene.

Do not add a skip/fast-forward control in this task.

## Visual Acceptance Criteria

Dela must be able to open the browser and see:

1. A scenario or demo board.
2. The radio call-in sequence begins automatically.
3. The first/highest-ranking unit is highlighted on the board.
4. Its matching panel/card highlights at the same time.
5. The panel/card shows placeholder portrait, name/callsign, and movement icon.
6. The radio text/window is tinted by faction color.
7. The sequence advances through all player pieces by rank.
8. After the final piece calls in, the UI returns to the normal scenario/play state.

## Technical Acceptance Criteria

- The project runs locally in the browser.
- The feature is connected to the visible app.
- The build passes.
- Existing major UI should not regress.
- No large unrelated refactors.
- No new art dependency.
- No new package dependency unless absolutely necessary.
- No hidden/unreachable feature work.
- No speculative systems outside this task.

## Repo Safety

Before editing:

- Check repo status.
- If there are uncommitted changes, stop and report them before proceeding.
- Do not move or rename files unless absolutely necessary.
- Do not rewrite history.
- Do not install packages without explicit approval.
- Keep changes focused on this feature.

## Final Deliverable

A working browser-visible radio call-in intro for scenario start, using named placeholders and faction-tinted UI, with synchronized board and panel highlights.

The final Codex message should tell Dela exactly how to view and verify it in the browser.
