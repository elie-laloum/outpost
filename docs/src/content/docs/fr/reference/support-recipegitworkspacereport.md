---
title: "RecipeGitWorkspaceReport"
description: "RecipeGitWorkspaceReport — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom                 | Type                              | Présence  | Rôle                                                                                                                                                 |
| ------------------- | --------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`              | `"git"`                           | Requis    | Identifie le rapport d’un workspace Git nommé.                                                                                                       |
| `integration`       | `ConflictResolution \| undefined` | Optionnel | Résolution de conflit de l’intégration de ce workspace, rapportée séparément de la consommation du workflow.                                         |
| `branch`            | `string`                          | Requis    | Branche du worktree géré du workspace nommé.                                                                                                         |
| `directory`         | `string`                          | Requis    | Répertoire du worktree partagé par toutes les sandboxes de ce workspace.                                                                             |
| `retainedDirectory` | `string \| undefined`             | Optionnel | Worktree conservé pour revue lorsque ce workspace n’a pas été intégré, par exemple après un échec, une annulation ou une politique de branche named. |

## Signature

```ts
export interface RecipeGitWorkspaceReport extends NonNullable<
  RecipeReport["workspace"]
> {
  readonly kind: "git";
  readonly integration?: ConflictResolution;
}
```

## Contrats associés

- [RecipeReport](../support-recipereport/)
