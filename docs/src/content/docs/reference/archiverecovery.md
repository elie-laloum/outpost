---
title: "archiveRecovery"
description: "archiveRecovery — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { archiveRecovery } from "@elie-laloum/outpost";
```

## Purpose and behavior

Snapshot and verify an existing recovery transfer, upload binary chunks with hashes, and publish its manifest last. The source is retained. An interrupted upload may retain unreferenced chunks; no incomplete manifest is published. The archive contains recovery payloads, not an independent replacement for the source Git repository.

[Complete example and detailed rules](../../guide/operations/storage-transports/).

## Parameters and properties

| Name                  | Type                     | Presence | Meaning                                                                                                                    |
| --------------------- | ------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryArchiveOptions` | Required | Verified local recovery transfer, destination transport and total payload bound.                                           |
| `options.directory`   | `string`                 | Required | Existing recovery transfer containing state.json, checksums.json and all required patches, bundles and extra files.        |
| `options.maxBytes`    | `number \| undefined`    | Optional | Positive total payload bound, default 1 GiB. Files are uploaded in bounded chunks after local snapshot verification.       |
| `options.transporter` | `Transport`              | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Returns

`Promise<TransportReference>`

## Signature

```ts
export declare function archiveRecovery(
  options: RecoveryArchiveOptions,
): Promise<TransportReference>;
```

## Related contracts

- [RecoveryArchiveOptions](../recoveryarchiveoptions/)
- [TransportReference](../transportreference/)
