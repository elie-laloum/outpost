---
title: "CommonAgentSettings"
description: "CommonAgentSettings — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name                | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                          |
| ------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `authentication`    | `AgentAuthentication \| undefined`              | Optional | Explicit authentication for this CLI harness: "account", "usage", { account: { file \| key \| variable } } or { usage: { key \| variable } }. Unsupported forms fail when the agent is composed. Omission prepares nothing and keeps the access already configured in the execution environment. |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                           |
| `saveConversations` | `boolean \| undefined`                          | Optional | Enable native transcript capture when the adapter supports it.                                                                                                                                                                                                                                   |
| `conversations`     | `ConversationStore \| undefined`                | Optional | Store that captures, locates and restores this agent’s sessions instead of the default native store, such as transportConversations() with the agent’s format. The format must match the agent, and saveConversations must not be false.                                                         |

## Signature

```ts
export interface CommonAgentSettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly saveConversations?: boolean;
  readonly conversations?: ConversationStore;
}
```

## Related contracts

- [AgentAuthentication](../agentauthentication/)
- [ConversationStore](../conversationstore/)
- [Variables](../variables/)
