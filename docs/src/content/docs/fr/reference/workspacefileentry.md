---
title: "WorkspaceFileEntry"
description: "WorkspaceFileEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceFileEntry } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                              | Présence  | Rôle                                                                                                           |
| -------- | --------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| `path`   | `string`                          | Requis    | Chemin relatif validé conservant son préfixe ; traversées et chemins de contrôle sont refusés.                 |
| `kind`   | `"file" \| "link" \| "directory"` | Requis    | Fichier ordinaire, lien symbolique relatif interne ou répertoire validés ; les fichiers spéciaux sont refusés. |
| `mode`   | `number`                          | Requis    | Bits de permissions portables conservés pour les fichiers ordinaires et les répertoires.                       |
| `size`   | `number`                          | Requis    | Taille en octets du contenu de fichier ou de la cible de lien validés.                                         |
| `sha256` | `string`                          | Requis    | Digest SHA-256 du contenu pour les contrôles d’intégrité et de concurrence, sans authentifier le publisher.    |
| `target` | `string \| undefined`             | Optionnel | Cible relative de lien symbolique qui doit rester dans la sélection déclarée.                                  |

## Signature

```ts
export interface WorkspaceFileEntry {
  readonly path: string;
  readonly kind: "file" | "link" | "directory";
  readonly mode: number;
  readonly size: number;
  readonly sha256: string;
  readonly target?: string;
}
```
