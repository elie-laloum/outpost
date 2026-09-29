---
title: "WorkspaceGitState"
description: "WorkspaceGitState — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom      | Type                                                           | Présence          | Rôle                                                                                                                                                                 |
| -------- | -------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`  | `"registered" \| "unregistered" \| "unavailable" \| "skipped"` | Requis            | registered : un worktree Git de ce dépôt ; unregistered : absent de git worktree list ; skipped : pas un dossier ; unavailable : l’inspection a échoué, voir reason. |
| `head`   | `string`                                                       | Selon la variante | Commit HEAD indiqué par git worktree list.                                                                                                                           |
| `branch` | `string \| null`                                               | Selon la variante | Nom de branche du worktree, ou null lorsque HEAD est détaché.                                                                                                        |
| `dirty`  | `boolean`                                                      | Selon la variante | true lorsque git status signale des changements suivis ou non suivis. Les fichiers ignorés ne comptent pas.                                                          |
| `locked` | `boolean`                                                      | Selon la variante | Indique si Git marque le worktree comme verrouillé.                                                                                                                  |
| `reason` | `string`                                                       | Selon la variante | Motif de l’état skipped (NOT_DIRECTORY) ou unavailable, tel que WORKSPACE_CHANGED, REGISTRATION_MISMATCH ou GIT_INSPECTION_FAILED.                                   |

## Signature

```ts
export type WorkspaceGitState =
  | {
      readonly state: "registered";
      readonly head: string;
      readonly branch: string | null;
      readonly dirty: boolean;
      readonly locked: boolean;
    }
  | {
      readonly state: "unregistered";
    }
  | {
      readonly state: "skipped" | "unavailable";
      readonly reason: string;
    };
```
