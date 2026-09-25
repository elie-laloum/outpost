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

| Name          | Type        | Presence | Meaning                                                                                                                    |
| ------------- | ----------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `namespace`   | `string`    | Required | Stable logical project namespace, independent of checkout paths. Use distinct namespaces for unrelated projects.           |
| `transporter` | `Transport` | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Signature

```ts
export interface TransportConversationOptions extends TransportStoreOptions {
  readonly namespace: string;
}
```

## Related contracts

- [TransportStoreOptions](../transportstoreoptions/)
