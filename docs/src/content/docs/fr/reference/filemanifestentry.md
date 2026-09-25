---
title: "FileManifestEntry"
description: "FileManifestEntry — Outpost API"
sidebar:
  order: 10
---

Contrat public de **FileManifestEntry**. Consultez le [guide transferts distants](../../guide/operations/remote-transfers/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { FileManifestEntry } from "@elie-laloum/outpost";
```

## Rôle et comportement

Transférer fichiers binaires et manifestes validés en préservant les modifications hôtes concurrentes.

La synchronisation valide et sauvegarde avant application. Les transferts préservent permissions et liens pris en charge et rejettent les traversées dangereuses. Les données de récupération survivent à un nettoyage risqué.

[Exemple complet et règles détaillées](../../guide/operations/remote-transfers/).

## Paramètres et propriétés

| Nom      | Type               | Présence | Rôle                                                                             |
| -------- | ------------------ | -------- | -------------------------------------------------------------------------------- |
| `path`   | `string`           | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `kind`   | `"file" \| "link"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `mode`   | `number`           | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `size`   | `number`           | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `sha256` | `string`           | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface FileManifestEntry {
  readonly path: string;
  readonly kind: "file" | "link";
  readonly mode: number;
  readonly size: number;
  readonly sha256: string;
}
```
