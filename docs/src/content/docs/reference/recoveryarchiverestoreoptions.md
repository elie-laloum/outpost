---
title: "RecoveryArchiveRestoreOptions"
description: "RecoveryArchiveRestoreOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryArchiveRestoreOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                                                                                                    |
| ------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `reference`   | `TransportReference`  | Required | Pinned manifest returned by archiveRecovery; every chunk revision and SHA-256 is checked.                                  |
| `destination` | `string`              | Required | New local directory whose parent already exists. Existing destinations are refused; partial data is retained on failure.   |
| `maxBytes`    | `number \| undefined` | Optional | Positive total restored payload limit, default 1 GiB; also bounds recovery integrity verification.                         |
| `transporter` | `Transport`           | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Signature

```ts
export interface RecoveryArchiveRestoreOptions extends TransportStoreOptions {
  readonly reference: TransportReference;
  readonly destination: string;
  readonly maxBytes?: number;
}
```

## Related contracts

- [TransportReference](../transportreference/)
- [TransportStoreOptions](../transportstoreoptions/)
