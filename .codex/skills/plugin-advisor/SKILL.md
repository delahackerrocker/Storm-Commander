---
name: plugin-advisor
description: Check which Codex plugins or plugin-backed capabilities are available, decide whether any would materially help the current user request, and prompt the user before asking them to turn on or install a helpful plugin. Use when the user asks about available plugins, enabling plugins, missing capabilities, connectors, integrations, app/plugin setup, or when a task may benefit from an optional Codex plugin that is not currently active.
---

# Plugin Advisor

## Overview

Use this skill to triage optional Codex plugins without derailing the user's task. Prefer continuing with existing tools when they are enough; prompt about plugins only when a plugin would unlock a capability, improve reliability, or avoid substantial manual work.

## Workflow

1. Identify the user's immediate goal and the capability needed.
2. Check currently available tools, plugins, skills, and app connectors from the active context.
3. If the needed capability may exist but is not visible, use `tool_search` when available to search for plugin-backed tools before asking the user.
4. Compare candidates against the task:
   - Use an existing active tool or skill directly if it is sufficient.
   - Recommend turning on a plugin only when it adds a concrete missing capability, authentication context, domain-specific workflow, or safer automation.
   - Do not recommend a plugin merely because it is adjacent or convenient.
5. If a plugin or connector is worth enabling, ask the user for permission in one concise sentence that names the plugin and the benefit.
6. After the user decides, proceed:
   - If enabled, use the newly available capability.
   - If declined or unavailable, continue with the best non-plugin fallback and state the limitation briefly.

## Prompting Rules

- Ask at most one plugin-enablement question at a time unless the user explicitly asks to compare options.
- Explain the tradeoff in task terms, not plugin marketing terms.
- Prefer exact plugin names from the current context or `tool_search` results.
- Do not imply a plugin is available unless the active context or `tool_search` confirms it.
- Do not request installation for broad categories of tools; request one known plugin or connector only when it exactly fits the user's stated need.
- If the environment exposes a dedicated plugin installation tool, use it only after confirming the requested plugin is not already active and matches the known installable list.

## Good Recommendations

- "The GitHub plugin would let me inspect the PR comments directly. Do you want me to turn it on for this?"
- "I can continue from the pasted text, but the Figma plugin would let me inspect the live design. Should I use it?"
- "This needs authenticated calendar access. Do you want to connect Google Calendar so I can check availability?"

## Avoid

- Do not interrupt simple tasks with plugin suggestions.
- Do not ask the user to enable a plugin that only saves a tiny amount of work.
- Do not use stale memory about plugins; check the active context first.
- Do not treat skills and plugins as interchangeable: skills provide instructions, while plugins may provide tools, apps, or authenticated integrations.
