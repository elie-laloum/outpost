---
title: "CommonAgentSettings"
description: "CommonAgentSettings — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name                | Type                                            | Presence | Meaning                                                                                                                                      |
| ------------------- | ----------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`             | `string \| undefined`                           | Optional | Native CLI model identifier; availability depends on the account.                                                                            |
| `authentication`    | `AgentAuthentication \| undefined`              | Optional | Explicit authentication preparation for this CLI harness. Omission preserves already-configured access without discovering host credentials. |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                       |
| `saveConversations` | `boolean \| undefined`                          | Optional | Enable native transcript capture when the adapter supports it.                                                                               |

## Signature

```ts
export interface CommonAgentSettings {
  readonly model?: string;
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly saveConversations?: boolean;
}
```

## Related contracts

- [AgentAuthentication](../agentauthentication/)
- [Variables](../variables/)
