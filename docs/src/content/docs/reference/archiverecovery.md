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

Upload a verified snapshot of a local recovery transfer in 4 MiB chunks, publish its manifest last and return the manifest reference. The source directory is kept. An interrupted upload can leave unreferenced chunks but never publishes a manifest.

[Complete example and detailed rules](../../guide/recovery/).

## Parameters and properties

| Name                  | Type                          | Presence | Meaning                                                                                                                    |
| --------------------- | ----------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryArchiveOptions`      | Required | Verified local recovery transfer, destination transport and total payload bound.                                           |
| `options.directory`   | `string`                      | Required | Existing recovery transfer containing state.json, checksums.json and all required patches, bundles and extra files.        |
| `options.maxBytes`    | `number \| undefined`         | Optional | Total payload bound, default 1 GiB; applies to the local snapshot and to the upload.                                       |
| `options.transporter` | `Transport`                   | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |
| `observation`         | `ObservationHub \| undefined` | Optional | Hub that receives the start and end events of the archive upload.                                                          |

## Returns

`Promise<TransportReference>`

## Signature

```ts
export declare function archiveRecovery(
  options: RecoveryArchiveOptions,
  observation?: ObservationHub,
): Promise<TransportReference>;
```

## Related contracts

- [ObservationHub](../observationhub/)
- [RecoveryArchiveOptions](../recoveryarchiveoptions/)
- [TransportReference](../transportreference/)
