---
title: "antigravityHarness"
description: "antigravityHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { antigravityHarness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create an Antigravity CLI (agy) harness from execution, authentication and permission settings without starting the CLI. Compose it with agent({ harness, model }) to select a model name independently; reasoning and maxOutputTokens are rejected. Warm resume and automatic response repairs reuse a conversation in the same open sandbox. Portable capture, cold resume and automated fork are rejected. The CLI owns its internal model/tool loop.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name                      | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                          |
| ------------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `settings`                | `AntigravitySettings \| undefined`              | Optional | Configuration for the Antigravity CLI harness; pass the selected model to agent() instead.                                                                                                                                                                                                       |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optional | Explicit authentication for this CLI harness: "account", "usage", { account: { file \| key \| variable } } or { usage: { key \| variable } }. Unsupported forms fail when the agent is composed. Omission prepares nothing and keeps the access already configured in the execution environment. |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                           |
| `settings.mode`           | `"accept-edits" \| "plan" \| undefined`         | Optional | Antigravity execution mode passed with --mode. Without it, headless runs pass --dangerously-skip-permissions; interactive sessions keep the CLI's approval prompts.                                                                                                                              |

## Returns

`CliHarness`

## Signature

```ts
export declare function antigravityHarness(
  settings?: AntigravitySettings,
): CliHarness;
```

## Related contracts

- [AntigravitySettings](../antigravitysettings/)
- [CliHarness](../cliharness/)
