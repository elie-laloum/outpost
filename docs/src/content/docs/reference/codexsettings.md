---
title: "CodexSettings"
description: "CodexSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CodexSettings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                          |
| ------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modelProvider`     | `CodexModelProvider \| undefined`               | Optional | Custom Codex model endpoint configuration; requires Responses API compatibility.                                                                                                                                                                                                                 |
| `approvalReviewer`  | `"user" \| "auto_review" \| undefined`          | Optional | Codex approval reviewer: the user or automatic approval review.                                                                                                                                                                                                                                  |
| `authentication`    | `AgentAuthentication \| undefined`              | Optional | Explicit authentication for this CLI harness: "account", "usage", { account: { file \| key \| variable } } or { usage: { key \| variable } }. Unsupported forms fail when the agent is composed. Omission prepares nothing and keeps the access already configured in the execution environment. |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                           |
| `saveConversations` | `boolean \| undefined`                          | Optional | Enable native transcript capture when the adapter supports it.                                                                                                                                                                                                                                   |
| `conversations`     | `ConversationStore \| undefined`                | Optional | Store that captures, locates and restores this agent’s sessions instead of the default native store, such as transportConversations() with the agent’s format. The format must match the agent, and saveConversations must not be false.                                                         |

## Signature

```ts
export interface CodexSettings extends CommonAgentSettings {
  readonly modelProvider?: CodexModelProvider;
  readonly approvalReviewer?: "user" | "auto_review";
}
```

## Related contracts

- [CodexModelProvider](../codexmodelprovider/)
- [CommonAgentSettings](../support-commonagentsettings/)
