# 20260501_Chessish_Task_04_Separate_Style_Sources

## Agent Thinking Level

Medium. This is a small but important architecture task. The goal is style separation, not visual redesign.

## Safety / Repo Rule

Before making changes, check git status.

If there are uncommitted local changes, stop and ask Dela before proceeding.

## Goal

Separate the styling source of truth for the two chess experiences:

```text
Standard Chess
Storm Commander
```

For now, the two style files may be visually identical. That is acceptable.

The important requirement is that changing Standard Chess styling later must not affect Storm Commander, and changing Storm Commander styling later must not affect Standard Chess.

## Context

The app now has or is expected to have:

1. A standard chess experience.
2. A Storm Commander chess variant launched from the main menu.
3. Storm Commander piece rendering through local PNGs.
4. Shared gameplay logic between both versions.

This task is only about styling ownership and CSS isolation.

## Core Requirement

Create separate styling files for each game version.

Recommended files:

```text
src/styles/standardChess.css
src/styles/stormCommander.css
```

If the project already has a more appropriate style folder convention, use it, but the result must still be clearly separated by game variant.

## Required Behavior

After this task:

1. Standard Chess imports and uses only its own variant-specific style file.
2. Storm Commander imports and uses only its own variant-specific style file.
3. Shared global app styles remain allowed only for truly global shell concerns.
4. Board, square, piece, panel, status, highlight, and layout styling must not be accidentally shared between the two chess variants.
5. The two CSS files may contain duplicate declarations for now.
6. Future edits to one file should not visually affect the other variant.

## Suggested Architecture

Use explicit wrapper classes to scope each variant.

Suggested wrappers:

```jsx
<div className="standard-chess-root">
  ...standard chess app...
</div>

<div className="storm-commander-root">
  ...storm commander app...
</div>
```

Then scope CSS under each root.

Example:

```css
.standard-chess-root .chess-board {
  display: grid;
}
```

```css
.storm-commander-root .chess-board {
  display: grid;
}
```

This duplication is intentional. These are now two different visual products that happen to look the same today.

## Alternative Acceptable Architecture

CSS Modules are also acceptable if the current app already uses them or if Codex determines that they are cleaner.

Example:

```text
StandardChess.module.css
StormCommander.module.css
```

Only use CSS Modules if the change remains simple and does not require a large refactor.

Plain CSS with scoped root classes is preferred for this task.

## Shared Styles Rule

Avoid shared chess-specific style rules.

Allowed shared global styles:

```text
body
html
#root
font smoothing
basic reset
main menu shell, if already global
```

Not allowed as shared styling after this task:

```text
.chess-board
.chess-square
.chess-piece
.chess-piece-image
.selected-square
.legal-move
.capture-move
.last-move
.game-status
.move-history
.scenario-panel
.scenario-metadata-panel
```

Those should be owned by either Standard Chess or Storm Commander styling, even if the declarations are currently identical.

## Variant Style Ownership

### Standard Chess

Create or update the standard chess styling file.

Suggested file:

```text
src/styles/standardChess.css
```

It should own the Standard Chess presentation for:

- Board layout
- Square colors
- Piece display
- Selected square state
- Legal move highlight
- Capture highlight
- Last move highlight
- Game status panel
- Move history
- Scenario / puzzle metadata panel, if visible in Standard Chess
- Any standard chess-specific layout spacing

### Storm Commander

Create or update the Storm Commander styling file.

Suggested file:

```text
src/styles/stormCommander.css
```

It should own the Storm Commander presentation for:

- Board layout
- Square colors
- PNG piece image sizing
- PNG piece image alignment
- Selected square state
- Legal move highlight
- Capture highlight
- Last move highlight
- Game status panel
- Move history
- Scenario / puzzle metadata panel, if visible in Storm Commander
- Any Storm Commander-specific layout spacing

For now, Storm Commander can look identical to Standard Chess except for PNG piece rendering.

## Import Rules

Do not import both style files into the same variant component unless there is a very specific reason.

Preferred pattern:

```js
// StandardChessPage.jsx
import "../styles/standardChess.css";
```

```js
// StormCommanderPage.jsx
import "../styles/stormCommander.css";
```

If the app has one shared chess component, pass a `variant` prop and apply a root wrapper class. The page-level components should still be responsible for importing the correct style file.

## Refactor Guidance

Do the smallest useful refactor.

Good:

- Add page/wrapper components if they do not exist yet.
- Add variant root classes.
- Move chess-specific CSS rules out of a shared `styles.css` file.
- Duplicate rules into both variant CSS files.
- Keep shared gameplay components unchanged except for class scoping support.

Avoid:

- Rebuilding the UI.
- Adding a theme engine.
- Adding runtime style switching.
- Adding a visual editor.
- Adding CSS variables unless they already exist and remain variant-scoped.
- Changing gameplay logic.

## Main Menu Requirement

The main menu should still route correctly:

```text
Standard Chess button -> Standard Chess
Storm Commander button -> Storm Commander
```

Both versions should load and play after the style split.

## Scenario / Puzzle UI Requirement

If the scenario / puzzle metadata panel exists, it must also respect the style split.

Standard Chess scenario UI should be styled by:

```text
standardChess.css
```

Storm Commander scenario UI should be styled by:

```text
stormCommander.css
```

It is acceptable for both files to contain identical copied styles for the metadata panel today.

## PNG Piece Requirement

Storm Commander must continue using its local PNG pieces.

The PNG piece image class should be owned by Storm Commander styling.

Example:

```css
.storm-commander-root .chess-piece-image {
  width: 82%;
  height: 82%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}
```

Standard Chess should not depend on Storm Commander PNG styling.

## Testing Requirements

Add or update tests if the project already has React tests.

Suggested test file:

```text
src/tests/separateVariantStyles.test.jsx
```

At minimum, test:

1. Standard Chess renders with a `standard-chess-root` or equivalent wrapper.
2. Storm Commander renders with a `storm-commander-root` or equivalent wrapper.
3. Standard Chess route/page does not render the Storm Commander root.
4. Storm Commander route/page does not render the Standard Chess root.
5. Storm Commander still renders PNG piece images.
6. Standard Chess still renders its original piece style.

If automated style import testing is awkward, document the limitation and cover it in the manual checklist.

## Manual Test Checklist

Create or update:

```text
docs/20260501_Chessish_Task_04_Separate_Style_Sources_Manual_Test_Checklist.md
```

Include:

1. App starts with no console errors.
2. Main menu appears.
3. Standard Chess opens.
4. Storm Commander opens.
5. Standard Chess board renders correctly.
6. Storm Commander board renders correctly.
7. Standard Chess pieces render in the original style.
8. Storm Commander pieces render from PNGs.
9. Editing `standardChess.css` changes only Standard Chess.
10. Editing `stormCommander.css` changes only Storm Commander.
11. Move highlights still work in Standard Chess.
12. Move highlights still work in Storm Commander.
13. Captures still work in both variants.
14. Computer moves still work in both variants.
15. Scenario / puzzle metadata styling, if present, does not leak between variants.

## Acceptance Criteria

This task is complete when:

- Standard Chess has its own styling source of truth.
- Storm Commander has its own styling source of truth.
- The two style files may currently be identical, but they are physically and logically separate.
- Chess-specific styles are no longer accidentally shared through a common global chess stylesheet.
- Each variant has a clear root wrapper or equivalent scoping mechanism.
- Changing one variant style file does not affect the other variant.
- Standard Chess still works.
- Storm Commander still works.
- Storm Commander still uses local PNG pieces.
- Main menu navigation still works.
- The project builds with no errors.
- Normal play produces no console errors.

## Non-Goals

Do not implement:

- New Storm Commander rules
- New art direction
- New themes
- Theme editor
- Runtime skin switching
- CSS-in-JS migration
- Tailwind migration
- Animation polish
- Unity implementation
- Gameplay changes
- New scenario logic

## Final Report Back To Dela

When finished, report:

1. What files were created or changed.
2. Which file owns Standard Chess styling.
3. Which file owns Storm Commander styling.
4. What wrapper class or scoping mechanism was used.
5. Whether any styles remain shared and why.
6. How to verify that changing one style file does not affect the other.
7. What tests were added or updated.
8. Any known limitations or TODOs.
