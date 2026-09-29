---
title: "FileTransfers"
description: "FileTransfers — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileTransfers } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                                                                                                                      | Presence | Meaning                                                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uploadBatch`   | `((source: string, entries: readonly FileManifestEntry[], destination: string, options?: TransferOptions) => Promise<void>) \| undefined` | Optional | Uploads the listed manifest entries from a host directory into a sandbox directory, in batches. Without it, Outpost calls upload() for each file.                                                         |
| `manifest`      | `(source: string, paths: readonly string[], options?: TransferOptions) => Promise<readonly FileManifestEntry[]>`                          | Required | Describes the listed paths, relative to a sandbox directory, with kind, permission bits, size and SHA-256. Outpost uses it to skip files unchanged since the last transfer.                               |
| `downloadBatch` | `(source: string, entries: readonly FileManifestEntry[], destination: string, options?: TransferOptions) => Promise<void>`                | Required | Downloads the listed manifest entries from a sandbox directory into a host directory, in bounded batches. Outpost then checks each file against the manifest and fails with code workspace on a mismatch. |

## Signature

```ts
export interface FileTransfers {
  uploadBatch?(
    source: string,
    entries: readonly FileManifestEntry[],
    destination: string,
    options?: TransferOptions,
  ): Promise<void>;
  manifest(
    source: string,
    paths: readonly string[],
    options?: TransferOptions,
  ): Promise<readonly FileManifestEntry[]>;
  downloadBatch(
    source: string,
    entries: readonly FileManifestEntry[],
    destination: string,
    options?: TransferOptions,
  ): Promise<void>;
}
```

## Related contracts

- [FileManifestEntry](../filemanifestentry/)
- [TransferOptions](../transferoptions/)
