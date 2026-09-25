---
title: "gemini"
description: "gemini — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { gemini } from "@elie-laloum/outpost";
```

## Purpose and behavior

Namespace exposing harness() to configure the Gemini CLI CLI. Compose the returned harness with agent({ harness, model }) to select a model independently. The CLI owns its internal model/tool loop.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                              | Type                                                        | Presence | Meaning                                                                                                                                      |
| --------------------------------- | ----------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `harness`                         | `(settings?: Omit<GeminiSettings, "model">) => CliHarness`  | Required | Create a Gemini CLI harness from CLI execution, authentication and conversation settings, without starting the CLI.                          |
| `harness.settings`                | `Omit<GeminiSettings, "model"> \| undefined`                | Optional | Configuration for the Gemini CLI harness; pass the selected model to agent() instead.                                                        |
| `harness.settings.authentication` | `AgentAuthentication \| undefined`                          | Optional | Explicit authentication preparation for this CLI harness. Omission preserves already-configured access without discovering host credentials. |
| `harness.settings.variables`      | `Readonly<Record<string, string>> \| undefined`             | Optional | Explicit environment declarations; values are strings.                                                                                       |
| `harness.settings.approvalMode`   | `"default" \| "plan" \| "auto_edit" \| "yolo" \| undefined` | Optional | Gemini CLI tool-approval mode.                                                                                                               |

### harness()

```ts
harness(settings?: Omit<GeminiSettings, "model">): CliHarness
```

## Signature

```ts
export declare const gemini: Readonly<{
  harness(settings?: Omit<GeminiSettings, "model">): CliHarness;
}>;
```

## Related contracts

- [CliHarness](../cliharness/)
- [GeminiSettings](../geminisettings/)
