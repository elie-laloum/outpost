---
title: "createAntigravityHarness"
description: "createAntigravityHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAntigravityHarness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create an Antigravity CLI (agy) harness from execution, authentication and permission settings without starting the CLI. Compose it with createAgent({ harness, model }) to select a model name independently; reasoning and maxOutputTokens are rejected. Warm resume and automatic response repairs reuse a conversation in the same open sandbox. Portable capture, cold resume and automated fork are rejected. The CLI owns its internal model/tool loop.

[Complete example and detailed rules](../../guide/harness/).

## Parameters and properties

| Name                      | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                          |
| ------------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `settings`                | `AntigravitySettings \| undefined`              | Optional | Configuration for the Antigravity CLI harness; pass the selected model to createAgent() instead.                                                                                                                                                                                                 |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optional | Explicit authentication for this CLI harness: "account", "usage", { account: { file \| key \| variable } } or { usage: { key \| variable } }. Unsupported forms fail when the agent is composed. Omission prepares nothing and keeps the access already configured in the execution environment. |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                           |
| `settings.mcpServers`     | `McpServers \| undefined`                       | Optional | MCP servers merged into .gemini/config/mcp_config.json in the agent home, keyed by server name; other servers in the file are kept. On the local provider this is your own home. Each referenced variable must be declared.                                                                      |
| `settings.mode`           | `"accept-edits" \| "plan" \| undefined`         | Optional | Antigravity execution mode passed with --mode. Without it, headless runs pass --dangerously-skip-permissions; interactive sessions keep the CLI's approval prompts.                                                                                                                              |

## Returns

`CliHarness`

## Signature

```ts
export declare function createAntigravityHarness(
  settings?: AntigravitySettings,
): CliHarness;
```

## Related contracts

- [AntigravitySettings](../antigravitysettings/)
- [CliHarness](../cliharness/)
