---
title: "ClaudeSettings"
description: "ClaudeSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ClaudeSettings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                                                                              | Presence | Meaning                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| "max" \| undefined`                                    | Optional | Reasoning effort passed to the selected agent CLI.                |
| `permissions`       | `"default" \| "acceptEdits" \| "plan" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optional | Claude Code permission mode controlling tool approval behavior.   |
| `model`             | `string \| undefined`                                                                             | Optional | Native CLI model identifier; availability depends on the account. |
| `variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optional | Explicit environment declarations; values are strings.            |
| `saveConversations` | `boolean \| undefined`                                                                            | Optional | Enable native transcript capture when the adapter supports it.    |

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
