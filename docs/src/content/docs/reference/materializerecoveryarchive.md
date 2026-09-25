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

Download a pinned recovery archive into a new local directory, preserving supported modes and symlinks. Check chunk revisions, SHA-256 and recovery checksums. Keep the source and any partial destination on failure. Use the existing recovery planning and restoration APIs with the source repository to produce a checkout.

[Complete example and detailed rules](../../guide/operations/storage-transports/).

## Parameters and properties

| Name                  | Type                            | Presence | Meaning                                                                                                                    |
| --------------------- | ------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryArchiveRestoreOptions` | Required | Pinned archive reference, transport, new local destination and verification bound.                                         |
| `options.reference`   | `TransportReference`            | Required | Pinned manifest returned by archiveRecovery; every chunk revision and SHA-256 is checked.                                  |
| `options.destination` | `string`                        | Required | New local directory whose parent already exists. Existing destinations are refused; partial data is retained on failure.   |
| `options.maxBytes`    | `number \| undefined`           | Optional | Positive total restored payload limit, default 1 GiB; also bounds recovery integrity verification.                         |
| `options.transporter` | `Transport`                     | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Returns

`Promise<string>`

## Signature

```ts
export declare function materializeRecoveryArchive(
  options: RecoveryArchiveRestoreOptions,
): Promise<string>;
```

## Related contracts

- [RecoveryArchiveRestoreOptions](../recoveryarchiverestoreoptions/)
