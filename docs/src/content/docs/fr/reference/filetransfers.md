---
title: "FileTransfers"
description: "FileTransfers — Outpost API"
sidebar:
  order: 10
---

Contrat public de **FileTransfers**. Consultez le [guide transferts distants](../../guide/operations/remote-transfers/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { FileTransfers } from "@elie-laloum/outpost";
```

## Rôle et comportement

Transférer fichiers binaires et manifestes validés en préservant les modifications hôtes concurrentes.

La synchronisation valide et sauvegarde avant application. Les transferts préservent permissions et liens pris en charge et rejettent les traversées dangereuses. Les données de récupération survivent à un nettoyage risqué.

[Exemple complet et règles détaillées](../../guide/operations/remote-transfers/).

## Paramètres et propriétés

| Nom             | Type                                                                                                                                      | Présence  | Rôle                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `uploadBatch`   | `((source: string, entries: readonly FileManifestEntry[], destination: string, options?: TransferOptions) => Promise<void>) \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `manifest`      | `(source: string, paths: readonly string[], options?: TransferOptions) => Promise<readonly FileManifestEntry[]>`                          | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `downloadBatch` | `(source: string, entries: readonly FileManifestEntry[], destination: string, options?: TransferOptions) => Promise<void>`                | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
