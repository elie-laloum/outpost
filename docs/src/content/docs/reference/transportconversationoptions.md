---
title: "TransportConversationOptions"
description: "TransportConversationOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransportConversationOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type        | Presence | Meaning                                                                                                                                                                                                          |
| ------------- | ----------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `namespace`   | `string`    | Required | Project name in the keys, conversations/&lt;namespace>/&lt;format>/&lt;id>; must be a valid transport key. Use the same value on every machine that resumes these conversations, and a distinct one per project. |
| `transporter` | `Transport` | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport.                                                                                       |

## Signature

```ts
export interface TransportConversationOptions extends TransportStoreOptions {
  readonly namespace: string;
}
```

## Related contracts

- [TransportStoreOptions](../transportstoreoptions/)
