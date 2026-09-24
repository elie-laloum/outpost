---
title: "FileTransfers"
description: "FileTransfers — Outpost API"
sidebar:
  order: 10
---

Public contract for **FileTransfers**. See the [remote transfers guide](../../operations/remote-transfers/) for behavior, defaults and examples.

## Import

```ts
import type { FileTransfers } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface FileTransfers {
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
