---
title: "geminiHarness"
description: "geminiHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { geminiHarness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a Gemini CLI harness from execution, authentication and conversation settings without starting the CLI. Compose it with agent({ harness, model }) to select a model independently. The CLI owns its internal model/tool loop.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                      | Type                                                        | Presence | Meaning                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                | `Omit<GeminiSettings, "model"> \| undefined`                | Optional | Configuration for the Gemini CLI harness; pass the selected model to agent() instead.                                                        |
| `settings.authentication` | `AgentAuthentication \| undefined`                          | Optional | Explicit authentication preparation for this CLI harness. Omission preserves already-configured access without discovering host credentials. |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined`             | Optional | Explicit environment declarations; values are strings.                                                                                       |
| `settings.approvalMode`   | `"default" \| "plan" \| "auto_edit" \| "yolo" \| undefined` | Optional | Gemini CLI tool-approval mode.                                                                                                               |

## Returns

`CliHarness`

## Signature

```ts
export declare function geminiHarness(
  settings?: Omit<GeminiSettings, "model">,
): CliHarness;
```

## Related contracts

- [CliHarness](../cliharness/)
- [GeminiSettings](../geminisettings/)
