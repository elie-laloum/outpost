---
title: "RecipeWorkspaceCheckpoint"
description: "RecipeWorkspaceCheckpoint — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom      | Type                                                  | Présence  | Rôle                                                                                                                                             |
| -------- | ----------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `state`  | `"closed" \| "allocating" \| "ready" \| "integrated"` | Requis    | État d’allocation et de nettoyage ; allocating exige une récupération explicite et les ressources closed ne sont jamais remplacées à la reprise. |
| `record` | `WorkspaceRecord \| undefined`                        | Optionnel | Dépôt, branche, répertoire, métadonnées Git et base de comparaison d’origine conservés pour restaurer le workspace exact.                        |

## Signature

```ts
export interface RecipeWorkspaceCheckpoint {
  readonly state: "allocating" | "ready" | "integrated" | "closed";
  readonly record?: WorkspaceRecord;
}
```

## Contrats associés

- [WorkspaceRecord](../workspacerecord/)
