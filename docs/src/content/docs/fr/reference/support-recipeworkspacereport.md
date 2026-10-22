---
title: "RecipeWorkspaceReport"
description: "RecipeWorkspaceReport — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom                 | Type                               | Présence          | Rôle                                                                                                                              |
| ------------------- | ---------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `kind`              | `"git" \| "files"`                 | Requis            | git pour un workspace Git nommé, files pour un workspace de fichiers nommé ; détermine les autres champs.                         |
| `integration`       | `ConflictResolution \| undefined`  | Selon la variante | Workspaces Git : résolution de conflit de l’intégration de ce workspace.                                                          |
| `branch`            | `string`                           | Selon la variante | Workspaces Git : branche du worktree géré.                                                                                        |
| `directory`         | `string`                           | Selon la variante | Workspaces Git : répertoire du worktree partagé par toutes les sandboxes de ce workspace.                                         |
| `retainedDirectory` | `string \| undefined`              | Selon la variante | Workspaces Git : worktree conservé pour revue lorsque le workspace n’a pas été intégré.                                           |
| `workspaceInfo`     | `FileWorkspaceRecord \| undefined` | Selon la variante | Workspaces de fichiers : description versionnée conservant la propriété, la génération settled et les références de récupération. |
| `fileOutputs`       | `readonly WorkspacePublication[]`  | Selon la variante | Workspaces de fichiers : publications vérifiées des sorties déclarées par ce workspace.                                           |

## Signature

```ts
export type RecipeWorkspaceReport =
  RecipeGitWorkspaceReport | RecipeFileWorkspaceReport;
```

## Contrats associés

- [RecipeFileWorkspaceReport](../support-recipefileworkspacereport/)
- [RecipeGitWorkspaceReport](../support-recipegitworkspacereport/)
