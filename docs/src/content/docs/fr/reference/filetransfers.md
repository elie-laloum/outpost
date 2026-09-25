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

## Paramètres et propriétés

| Nom             | Type                                                                                                                                      | Présence  | Rôle                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `uploadBatch`   | `((source: string, entries: readonly FileManifestEntry[], destination: string, options?: TransferOptions) => Promise<void>) \| undefined` | Optionnel | Envoie en lot les entrées du manifeste de fichiers déclaré si cette capacité est prise en charge.            |
| `manifest`      | `(source: string, paths: readonly string[], options?: TransferOptions) => Promise<readonly FileManifestEntry[]>`                          | Requis    | Inspecte les chemins demandés en sandbox et renvoie nature, permissions, taille et SHA-256 de chaque entrée. |
| `downloadBatch` | `(source: string, entries: readonly FileManifestEntry[], destination: string, options?: TransferOptions) => Promise<void>`                | Requis    | Télécharge les entrées déclarées du manifeste dans un lot de transfert borné.                                |

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

## Contrats associés

- [FileManifestEntry](../filemanifestentry/)
- [TransferOptions](../transferoptions/)
