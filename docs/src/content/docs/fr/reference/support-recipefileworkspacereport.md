---
title: "RecipeFileWorkspaceReport"
description: "RecipeFileWorkspaceReport — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom             | Type                               | Présence  | Rôle                                                                                                                     |
| --------------- | ---------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| `kind`          | `"files"`                          | Requis    | Identifie le rapport d’un workspace de fichiers nommé.                                                                   |
| `workspaceInfo` | `FileWorkspaceRecord \| undefined` | Optionnel | Description versionnée de ce workspace conservant sa propriété, sa génération settled et ses références de récupération. |
| `fileOutputs`   | `readonly WorkspacePublication[]`  | Requis    | Publications vérifiées des sorties déclarées par ce workspace.                                                           |

## Signature

```ts
export interface RecipeFileWorkspaceReport {
  readonly kind: "files";
  readonly workspaceInfo?: FileWorkspaceRecord;
  readonly fileOutputs: readonly WorkspacePublication[];
}
```
