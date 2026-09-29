---
title: "CheckpointRecoveryOptions"
description: "CheckpointRecoveryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CheckpointRecoveryOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type        | Presence | Meaning                                                                                                                                     |
| ------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `runId`       | `string`    | Required | Run identity whose ownership is explicitly released; saved checkpoint values remain intact.                                                 |
| `revision`    | `string`    | Required | Revision of the checkpoint object read after stopping the old runner; if the object changed since, recovery rejects with TransportConflict. |
| `transporter` | `Transport` | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport.                  |

## Signature

```ts
export interface CheckpointRecoveryOptions extends TransportStoreOptions {
  readonly runId: string;
  readonly revision: string;
}
```

## Related contracts

- [TransportStoreOptions](../transportstoreoptions/)
