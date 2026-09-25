---
title: "TransportStoreOptions"
description: "TransportStoreOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransportStoreOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type        | Presence | Meaning                                                                                                                    |
| ------------- | ----------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport` | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Signature

```ts
export interface TransportStoreOptions {
  readonly transporter: Transport;
}
```

## Related contracts

- [Transport](../transport/)
