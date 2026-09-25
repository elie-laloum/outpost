---
title: "claude"
description: "claude — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { claude } from "@elie-laloum/outpost";
```

## Purpose and behavior

Build the Claude Code adapter, including CLI request construction, event decoding and native conversation storage. Model, reasoning and permission settings are passed to Claude; creating the adapter does not start a process or authenticate an account.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                         | Type                                                                                              | Presence | Meaning                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `settings`                   | `ClaudeSettings \| undefined`                                                                     | Optional | Claude model, reasoning, permissions, environment and transcript-capture settings. |
| `settings.reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| "max" \| undefined`                                    | Optional | Reasoning effort passed to the selected agent CLI.                                 |
| `settings.permissions`       | `"default" \| "acceptEdits" \| "plan" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optional | Claude Code permission mode controlling tool approval behavior.                    |
| `settings.model`             | `string \| undefined`                                                                             | Optional | Native CLI model identifier; availability depends on the account.                  |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optional | Explicit environment declarations; values are strings.                             |
| `settings.saveConversations` | `boolean \| undefined`                                                                            | Optional | Enable native transcript capture when the adapter supports it.                     |

## Returns

`AgentAdapter`

## Signature

```ts
export declare function claude(settings?: ClaudeSettings): AgentAdapter;
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [ClaudeSettings](../claudesettings/)
