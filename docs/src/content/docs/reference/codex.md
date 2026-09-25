---
title: "codex"
description: "codex — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { codex } from "@elie-laloum/outpost";
```

## Purpose and behavior

Namespace exposing harness() to configure the Codex CLI. Compose the returned harness with agent({ harness, model }) to select a model independently. The CLI owns its internal model/tool loop.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                                 | Type                                                      | Presence | Meaning                                                                                                                                      |
| ------------------------------------ | --------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `harness`                            | `(settings?: Omit<CodexSettings, "model">) => CliHarness` | Required | Create a Codex harness from CLI execution, authentication and conversation settings, without starting the CLI.                               |
| `harness.settings`                   | `Omit<CodexSettings, "model"> \| undefined`               | Optional | Configuration for the Codex harness; pass the selected model to agent() instead.                                                             |
| `harness.settings.reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| undefined`     | Optional | Reasoning effort passed to the selected agent CLI.                                                                                           |
| `harness.settings.authentication`    | `AgentAuthentication \| undefined`                        | Optional | Explicit authentication preparation for this CLI harness. Omission preserves already-configured access without discovering host credentials. |
| `harness.settings.variables`         | `Readonly<Record<string, string>> \| undefined`           | Optional | Explicit environment declarations; values are strings.                                                                                       |
| `harness.settings.saveConversations` | `boolean \| undefined`                                    | Optional | Enable native transcript capture when the adapter supports it.                                                                               |
| `harness.settings.modelProvider`     | `CodexModelProvider \| undefined`                         | Optional | Custom Codex model endpoint configuration; requires Responses API compatibility.                                                             |
| `harness.settings.approvalReviewer`  | `"user" \| "auto_review" \| undefined`                    | Optional | Codex approval reviewer: the user or automatic approval review.                                                                              |

### harness()

```ts
harness(settings?: Omit<CodexSettings, "model">): CliHarness
```

## Signature

```ts
export declare const codex: Readonly<{
  harness(settings?: Omit<CodexSettings, "model">): CliHarness;
}>;
```

## Related contracts

- [CliHarness](../cliharness/)
- [CodexSettings](../codexsettings/)
