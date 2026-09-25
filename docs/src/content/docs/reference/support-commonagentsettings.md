---
title: "CommonAgentSettings"
description: "CommonAgentSettings — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name                | Type                                            | Presence | Meaning                                                           |
| ------------------- | ----------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `model`             | `string \| undefined`                           | Optional | Native CLI model identifier; availability depends on the account. |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.            |
| `saveConversations` | `boolean \| undefined`                          | Optional | Enable native transcript capture when the adapter supports it.    |

## Signature

```ts
export interface CommonAgentSettings {
  readonly model?: string;
  readonly variables?: Variables;
  readonly saveConversations?: boolean;
}
```

## Related contracts

- [Variables](../variables/)
