---
title: "claude"
description: "claude — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { claude } from "@elie-laloum/outpost";
```

## Purpose and behavior

Namespace exposing harness() to configure the Claude Code CLI. Compose the returned harness with agent({ harness, model }) to select a model independently. The CLI owns its internal model/tool loop.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                                 | Type                                                                                              | Presence | Meaning                                                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `harness`                            | `(settings?: Omit<ClaudeSettings, "model">) => CliHarness`                                        | Required | Create a Claude Code harness from CLI execution, authentication and conversation settings, without starting the CLI.                         |
| `harness.settings`                   | `Omit<ClaudeSettings, "model"> \| undefined`                                                      | Optional | Configuration for the Claude Code harness; pass the selected model to agent() instead.                                                       |
| `harness.settings.reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| "max" \| undefined`                                    | Optional | Reasoning effort passed to the selected agent CLI.                                                                                           |
| `harness.settings.permissions`       | `"default" \| "acceptEdits" \| "plan" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optional | Claude Code permission mode controlling tool approval behavior.                                                                              |
| `harness.settings.authentication`    | `AgentAuthentication \| undefined`                                                                | Optional | Explicit authentication preparation for this CLI harness. Omission preserves already-configured access without discovering host credentials. |
| `harness.settings.variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optional | Explicit environment declarations; values are strings.                                                                                       |
| `harness.settings.saveConversations` | `boolean \| undefined`                                                                            | Optional | Enable native transcript capture when the adapter supports it.                                                                               |

### harness()

```ts
harness(settings?: Omit<ClaudeSettings, "model">): CliHarness
```

## Signature

```ts
export declare const claude: Readonly<{
  harness(settings?: Omit<ClaudeSettings, "model">): CliHarness;
}>;
```

## Related contracts

- [ClaudeSettings](../claudesettings/)
- [CliHarness](../cliharness/)
