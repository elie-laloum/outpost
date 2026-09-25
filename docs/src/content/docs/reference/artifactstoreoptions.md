---
title: "ArtifactStoreOptions"
description: "ArtifactStoreOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ArtifactStoreOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                                                                                                    |
| ------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `maxBytes`    | `number \| undefined` | Optional | Positive maximum artifact size in bytes, default 16 MiB; enforced before publication and while reading.                    |
| `transporter` | `Transport`           | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Signature

```ts
export interface ArtifactStoreOptions extends TransportStoreOptions {
  readonly maxBytes?: number;
}
```

## Related contracts

- [TransportStoreOptions](../transportstoreoptions/)
