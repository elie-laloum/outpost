---
title: "copilotHarness"
description: "copilotHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { copilotHarness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a GitHub Copilot CLI harness from execution, authentication and permission settings without starting the CLI. Compose it with agent({ harness, model }) to select a model name independently; reasoning and maxOutputTokens are rejected. Each run starts a fresh session: native capture, resume, fork and automatic response repairs are unsupported. The CLI owns its internal model/tool loop.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name                      | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                          |
| ------------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `settings`                | `CopilotSettings \| undefined`                  | Optional | Configuration for the GitHub Copilot CLI harness; pass the selected model to agent() instead.                                                                                                                                                                                                    |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optional | Explicit authentication for this CLI harness: "account", "usage", { account: { file \| key \| variable } } or { usage: { key \| variable } }. Unsupported forms fail when the agent is composed. Omission prepares nothing and keeps the access already configured in the execution environment. |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                           |

## Returns

`CliHarness`

## Signature

```ts
export declare function copilotHarness(settings?: CopilotSettings): CliHarness;
```

## Related contracts

- [CliHarness](../cliharness/)
- [CopilotSettings](../copilotsettings/)
