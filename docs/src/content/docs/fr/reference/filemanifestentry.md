---
title: "FileManifestEntry"
description: "FileManifestEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileManifestEntry } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type               | Présence | Rôle                                                                                                 |
| -------- | ------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `path`   | `string`           | Requis   | Chemin relatif de ce fichier ou lien symbolique dans l’arborescence transférée.                      |
| `kind`   | `"file" \| "link"` | Requis   | Indique si cette entrée contient les octets d’un fichier ordinaire ou la cible d’un lien symbolique. |
| `mode`   | `number`           | Requis   | Bits de permissions de fichiers à préserver pendant le transfert.                                    |
| `size`   | `number`           | Requis   | Taille en octets du contenu du fichier ou de la cible du lien décrit par le manifeste.               |
| `sha256` | `string`           | Requis   | Empreinte SHA-256 utilisée pour vérifier le contenu du fichier ou du lien transféré.                 |

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
