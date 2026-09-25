---
title: "claudeHarness"
description: "claudeHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { claudeHarness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a Claude Code harness from execution, authentication and conversation settings without starting the CLI. Compose it with agent({ harness, model }) to select a model independently. The CLI owns its internal model/tool loop.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                         | Type                                                                                              | Presence | Meaning                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                   | `ClaudeSettings \| undefined`                                                                     | Optional | Configuration for the Claude Code harness; pass the selected model to agent() instead.                                                       |
| `settings.permissions`       | `"default" \| "acceptEdits" \| "plan" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optional | Claude Code permission mode controlling tool approval behavior.                                                                              |
| `settings.authentication`    | `AgentAuthentication \| undefined`                                                                | Optional | Explicit authentication preparation for this CLI harness. Omission preserves already-configured access without discovering host credentials. |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optional | Explicit environment declarations; values are strings.                                                                                       |
| `settings.saveConversations` | `boolean \| undefined`                                                                            | Optional | Enable native transcript capture when the adapter supports it.                                                                               |

## Returns

`CliHarness`

## Signature

```ts
export declare function claudeHarness(settings?: ClaudeSettings): CliHarness;
```

## Related contracts

- [ClaudeSettings](../claudesettings/)
- [CliHarness](../cliharness/)
