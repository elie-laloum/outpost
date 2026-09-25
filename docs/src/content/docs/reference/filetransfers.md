---
title: "FileTransfers"
description: "FileTransfers — Outpost API"
sidebar:
  order: 10
---

Public contract for **FileTransfers**. See the [remote transfers guide](../../guide/operations/remote-transfers/) for behavior, defaults and examples.

## Import

```ts
import type { FileTransfers } from "@elie-laloum/outpost";
```

## Purpose and behavior

Move binary files and validated manifests while preserving concurrent host edits.

Synchronization validates and backs up before applying incoming work. Transfers preserve supported permissions and symlinks and reject unsafe destination traversal. Recovery data survives unsafe cleanup.

[Complete example and detailed rules](../../guide/operations/remote-transfers/).

## Parameters and properties

| Name            | Type                                                                                                                                      | Presence | Meaning                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `uploadBatch`   | `((source: string, entries: readonly FileManifestEntry[], destination: string, options?: TransferOptions) => Promise<void>) \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `manifest`      | `(source: string, paths: readonly string[], options?: TransferOptions) => Promise<readonly FileManifestEntry[]>`                          | Required | See the linked contract and this family's rules for its interpretation. |
| `downloadBatch` | `(source: string, entries: readonly FileManifestEntry[], destination: string, options?: TransferOptions) => Promise<void>`                | Required | See the linked contract and this family's rules for its interpretation. |

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
