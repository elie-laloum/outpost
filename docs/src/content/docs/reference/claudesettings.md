---
title: "ClaudeSettings"
description: "ClaudeSettings — Outpost API"
sidebar:
  order: 10
---

Public contract for **ClaudeSettings**. See the [agents guide](../../guide/agents/adapters/) for behavior, defaults and examples.

## Import

```ts
import type { ClaudeSettings } from "@elie-laloum/outpost";
```

## Purpose and behavior

Configure native Claude Code, Codex or Gemini behavior independently of the sandbox backend.

The installed CLI chooses its model when omitted. Native conversation capture defaults on for Claude/Codex. Gemini supports fresh sessions only. Account and provider credentials are separate.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                | Type                                                                                              | Presence | Meaning                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| "max" \| undefined`                                    | Optional | See the linked contract and this family's rules for its interpretation. |
| `permissions`       | `"default" \| "acceptEdits" \| "plan" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `model`             | `string \| undefined`                                                                             | Optional | Native CLI model identifier; availability depends on the account.       |
| `variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optional | Explicit environment declarations; values are strings.                  |
| `saveConversations` | `boolean \| undefined`                                                                            | Optional | Enable native transcript capture when the adapter supports it.          |

## Signature

```ts
export interface ClaudeSettings extends CommonAgentSettings {
  readonly reasoning?: "low" | "medium" | "high" | "xhigh" | "max";
  readonly permissions?:
    | "default"
    | "acceptEdits"
    | "plan"
    | "auto"
    | "dontAsk"
    | "bypassPermissions";
}
```

## Related contracts

- [CommonAgentSettings](../support-commonagentsettings/)
