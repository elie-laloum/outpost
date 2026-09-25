---
title: "codexHarness"
description: "codexHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { codexHarness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a Codex harness from execution, authentication and conversation settings without starting the CLI. Compose it with agent({ harness, model }) to select a model independently. The CLI owns its internal model/tool loop.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                         | Type                                                  | Presence | Meaning                                                                                                                                      |
| ---------------------------- | ----------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                   | `Omit<CodexSettings, "model"> \| undefined`           | Optional | Configuration for the Codex harness; pass the selected model to agent() instead.                                                             |
| `settings.reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| undefined` | Optional | Reasoning effort passed to the selected agent CLI.                                                                                           |
| `settings.authentication`    | `AgentAuthentication \| undefined`                    | Optional | Explicit authentication preparation for this CLI harness. Omission preserves already-configured access without discovering host credentials. |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined`       | Optional | Explicit environment declarations; values are strings.                                                                                       |
| `settings.saveConversations` | `boolean \| undefined`                                | Optional | Enable native transcript capture when the adapter supports it.                                                                               |
| `settings.modelProvider`     | `CodexModelProvider \| undefined`                     | Optional | Custom Codex model endpoint configuration; requires Responses API compatibility.                                                             |
| `settings.approvalReviewer`  | `"user" \| "auto_review" \| undefined`                | Optional | Codex approval reviewer: the user or automatic approval review.                                                                              |

## Returns

`CliHarness`

## Signature

```ts
export declare function codexHarness(
  settings?: Omit<CodexSettings, "model">,
): CliHarness;
```

## Related contracts

- [CliHarness](../cliharness/)
- [CodexSettings](../codexsettings/)
