---
title: "TaskCacheStoreOptions"
description: "TaskCacheStoreOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskCacheStoreOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                                                                                                    |
| ------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `maxBytes`    | `number \| undefined` | Optional | Positive maximum serialized entry size in bytes, default 16 MiB; enforced when writing and reading.                        |
| `transporter` | `Transport`           | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Signature

```ts
export interface TaskCacheStoreOptions extends TransportStoreOptions {
  readonly maxBytes?: number;
}
```

## Related contracts

- [TransportStoreOptions](../transportstoreoptions/)
