---
title: "FileTransfers"
description: "FileTransfers — Outpost API"
sidebar:
  order: 10
---

Contrat public de **FileTransfers**. Consultez le [guide transferts distants](../../operations/remote-transfers/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [FileManifestEntry](../filemanifestentry/)
- [TransferOptions](../transferoptions/)
