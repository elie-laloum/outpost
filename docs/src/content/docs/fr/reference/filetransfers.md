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

| Nom             | Type                                                                                                                                      | Présence  | Rôle                                                                                                                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uploadBatch`   | `((source: string, entries: readonly FileManifestEntry[], destination: string, options?: TransferOptions) => Promise<void>) \| undefined` | Optionnel | Envoie par lots les entrées de manifeste listées d’un répertoire hôte vers un répertoire de la sandbox. Sans elle, Outpost appelle upload() pour chaque fichier.                                                        |
| `manifest`      | `(source: string, paths: readonly string[], options?: TransferOptions) => Promise<readonly FileManifestEntry[]>`                          | Requis    | Décrit les chemins listés, relatifs à un répertoire de la sandbox, avec nature, bits de permissions, taille et SHA-256. Outpost s’en sert pour ignorer les fichiers inchangés depuis le dernier transfert.              |
| `downloadBatch` | `(source: string, entries: readonly FileManifestEntry[], destination: string, options?: TransferOptions) => Promise<void>`                | Requis    | Télécharge par lots bornés les entrées de manifeste listées d’un répertoire de la sandbox vers un répertoire hôte. Outpost compare ensuite chaque fichier au manifeste et échoue avec le code workspace en cas d’écart. |

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
