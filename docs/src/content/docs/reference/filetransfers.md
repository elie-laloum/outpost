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

| Name            | Type                                                                                                                                      | Presence | Meaning                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `uploadBatch`   | `((source: string, entries: readonly FileManifestEntry[], destination: string, options?: TransferOptions) => Promise<void>) \| undefined` | Optional | Upload the declared file-manifest entries as a batch when supported.                                      |
| `manifest`      | `(source: string, paths: readonly string[], options?: TransferOptions) => Promise<readonly FileManifestEntry[]>`                          | Required | Inspect the requested paths in the sandbox and return kind, permissions, size and SHA-256 for each entry. |
| `downloadBatch` | `(source: string, entries: readonly FileManifestEntry[], destination: string, options?: TransferOptions) => Promise<void>`                | Required | Download the declared manifest entries as one bounded transfer batch.                                     |

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
