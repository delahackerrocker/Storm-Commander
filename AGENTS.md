# AGENTS.md

Start here when working in this repository.

This repo is the Storm Commander / Chess-ish prototype workspace. The current playable prototype lives in `ReactSource/`; the older Unity-oriented project shell and long-term Unity direction remain in `UnitySource/`.

## Read First

- `PROJECT_CONTEXT.md` explains what the project is, the current architecture, and the long-term direction.
- `WORKLOG_SO_FAR.md` summarizes what has been built so far and why it exists.
- `README.md` is the short root readme.
- `ReactSource/README.md` has the React app commands and player-facing feature summary.

## Existing Task Specs

The original task briefs live in `_Tasks_/`.

- `_Tasks_/20260430_Chessish_Task_01_Basic_Chess_Setup.md` covers the first Unity-oriented chess prototype plan.
- `_Tasks_/20260430_Chessish_Task_01_React_Prototype_Setup.md` covers the React/Vite chess prototype shift.
- `_Tasks_/20260501_Chessish_Task_02_Scenario_Puzzle_Library.md` covers scenario and puzzle data.
- `_Tasks_/20260501_Chessish_Task_03_Storm_Commander_Menu_And_PNG_Pieces.md` covers the Storm Commander menu entry and local PNG pieces.
- `_Tasks_/20260501_Chessish_Task_04_Separate_Style_Sources.md` covers style ownership for Standard Chess and Storm Commander.

## Current Working Area

Most active work is under `ReactSource/`.

Useful commands:

```bash
cd ReactSource
npm.cmd run dev
npm.cmd run build
npm.cmd run test
```

Keep the React prototype practical and portable. It is a fast iteration shell for gameplay, scenario data, local art, and presentation experiments that may later be rebuilt in Unity.
