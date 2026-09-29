---
title: "RecoveryArchiveOptions"
description: "RecoveryArchiveOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryArchiveOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                                                                                                    |
| ------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `directory`   | `string`              | Required | Existing recovery transfer containing state.json, checksums.json and all required patches, bundles and extra files.        |
| `maxBytes`    | `number \| undefined` | Optional | Total payload bound, default 1 GiB; applies to the local snapshot and to the upload.                                       |
| `transporter` | `Transport`           | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Signature

```ts
export interface RecoveryArchiveOptions extends TransportStoreOptions {
  readonly directory: string;
  readonly maxBytes?: number;
}
```

## Related contracts

- [TransportStoreOptions](../transportstoreoptions/)
