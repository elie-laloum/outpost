---
title: "RecipeWorkspaceCheckpoint"
description: "RecipeWorkspaceCheckpoint — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom           | Type                                                  | Présence  | Rôle                                                                                                                                             |
| ------------- | ----------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fileRecord`  | `FileWorkspaceRecord \| undefined`                    | Optionnel | Description versionnée du workspace conservant sa propriété, sa génération settled et ses références de récupération.                            |
| `integration` | `ConflictResolution \| undefined`                     | Optionnel | Résultat de résolution de conflit persisté avec le workspace d’origine après intégration, dont la consommation distincte du résolveur.           |
| `state`       | `"ready" \| "allocating" \| "closed" \| "integrated"` | Requis    | État d’allocation et de nettoyage ; allocating exige une récupération explicite et les ressources closed ne sont jamais remplacées à la reprise. |
| `record`      | `WorkspaceRecord \| undefined`                        | Optionnel | Dépôt, branche, répertoire, métadonnées Git et base de comparaison d’origine conservés pour restaurer le workspace exact.                        |

## Signature

```ts
export interface RecipeWorkspaceCheckpoint {
  readonly fileRecord?: FileWorkspaceRecord;
  readonly integration?: RecipeReport["integration"];
  readonly state: "allocating" | "ready" | "integrated" | "closed";
  readonly record?: WorkspaceRecord;
}
```

## Contrats associés

- [RecipeReport](../support-recipereport/)
- [WorkspaceRecord](../workspacerecord/)
