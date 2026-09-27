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

| Name                | Type                                                                                              | Presence | Meaning                                                                                                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `partialMessages`   | `boolean \| undefined`                                                                            | Optional | Opt into Claude noninteractive partial stream messages and normalized text-delta events; interactive requests are unchanged.                                                                                                                                                                     |
| `permissions`       | `"plan" \| "default" \| "acceptEdits" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optional | Claude Code permission mode controlling tool approval behavior.                                                                                                                                                                                                                                  |
| `authentication`    | `AgentAuthentication \| undefined`                                                                | Optional | Explicit authentication for this CLI harness: "account", "usage", { account: { file \| key \| variable } } or { usage: { key \| variable } }. Unsupported forms fail when the agent is composed. Omission prepares nothing and keeps the access already configured in the execution environment. |
| `variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                           |
| `saveConversations` | `boolean \| undefined`                                                                            | Optional | Enable native transcript capture when the adapter supports it.                                                                                                                                                                                                                                   |

## Signature

```ts
export interface ClaudeSettings extends CommonAgentSettings {
  readonly partialMessages?: boolean;
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
