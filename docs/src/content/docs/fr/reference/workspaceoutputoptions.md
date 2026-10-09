---
title: "WorkspaceOutputOptions"
description: "WorkspaceOutputOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceOutputOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                   | Présence  | Rôle                                                                                                                             |
| --------------- | ---------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `paths`         | `readonly string[]`    | Requis    | Sélection explicite de chemins relatifs ; la sélection de copie n’applique pas implicitement .gitignore.                         |
| `destination`   | `string`               | Requis    | Destination hôte conservant les chemins relatifs sélectionnés ; le chevauchement d’une source inscriptible active est refusé.    |
| `policy`        | `"create" \| "update"` | Requis    | create exige une nouvelle destination ; update utilise un état attendu capturé avant tout remplacement.                          |
| `deleteMissing` | `boolean \| undefined` | Optionnel | false par défaut ; supprime seulement les fichiers de destination initialement sélectionnés absents des sorties correspondantes. |

## Signature

```ts
export interface WorkspaceOutputOptions {
  readonly paths: readonly string[];
  readonly destination: string;
  readonly policy: "create" | "update";
  readonly deleteMissing?: boolean;
}
```
