---
title: "CopilotSettings"
description: "CopilotSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CopilotSettings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `authentication` | `AgentAuthentication \| undefined`              | Optional | Explicit authentication for this CLI harness: "account", "usage", { account: { file \| key \| variable } } or { usage: { key \| variable } }. Unsupported forms fail when the agent is composed. Omission prepares nothing and keeps the access already configured in the execution environment. |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                           |
| `conversations`  | `ConversationStore \| undefined`                | Optional | Store that captures, locates and restores Copilot session bundles instead of the default native store, such as transportConversations("copilot", …). A store that declares another format is rejected when the harness is created.                                                               |

## Signature

```ts
export interface CopilotSettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly conversations?: ConversationStore;
}
```

## Related contracts

- [AgentAuthentication](../agentauthentication/)
- [ConversationStore](../conversationstore/)
- [Variables](../variables/)
