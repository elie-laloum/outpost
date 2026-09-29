---
title: "materializeRecoveryArchive"
description: "materializeRecoveryArchive — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { materializeRecoveryArchive } from "@elie-laloum/outpost";
```

## Purpose and behavior

Download a recovery archive into destination, checking each chunk’s revision and SHA-256 and then the transfer’s checksums, and return destination. Symlinks and file modes are restored; on failure the partial destination is kept. Bring the work back with planRecoveryRestore() and restoreRecoveryTransfer().

[Complete example and detailed rules](../../guide/recovery/).

## Parameters and properties

| Name                  | Type                            | Presence | Meaning                                                                                                                    |
| --------------------- | ------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryArchiveRestoreOptions` | Required | Pinned archive reference, transport, new local destination and verification bound.                                         |
| `options.reference`   | `TransportReference`            | Required | Pinned manifest returned by archiveRecovery; every chunk revision and SHA-256 is checked.                                  |
| `options.destination` | `string`                        | Required | New local directory whose parent already exists. Existing destinations are refused; partial data is retained on failure.   |
| `options.maxBytes`    | `number \| undefined`           | Optional | Positive total restored payload limit, default 1 GiB; also bounds recovery integrity verification.                         |
| `options.transporter` | `Transport`                     | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |
| `observation`         | `ObservationHub \| undefined`   | Optional | Hub that receives the start and end events of the archive download.                                                        |

## Returns

`Promise<string>`

## Signature

```ts
export declare function materializeRecoveryArchive(
  options: RecoveryArchiveRestoreOptions,
  observation?: ObservationHub,
): Promise<string>;
```

## Related contracts

- [ObservationHub](../observationhub/)
- [RecoveryArchiveRestoreOptions](../recoveryarchiverestoreoptions/)
