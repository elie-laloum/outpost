---
title: "WorkspaceSource"
description: "WorkspaceSource — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkspaceSource } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom          | Type                                                                                                             | Présence          | Rôle                                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"directory" \| "ephemeral" \| "git"`                                                                            | Requis            | Discriminant sélectionnant Git, une source dossier ou un workspace initialement vide.                                            |
| `directory`  | `string`                                                                                                         | Selon la variante | Répertoire local absolu de matérialisation ou de source ; ce chemin n’est pas une identité portable.                             |
| `access`     | `{ readonly mode: "copy"; } \| { readonly mode: "mount"; readonly target: string; readonly readOnly: boolean; }` | Selon la variante | La copie isole les changements de source ; le montage expose toute la source sous target avec un readOnly explicite.             |
| `repository` | `string \| undefined`                                                                                            | Selon la variante | Emplacement du dépôt Git ; les modes de fichiers refusent cette option avant allocation.                                         |
| `branch`     | `BranchPolicy \| undefined`                                                                                      | Selon la variante | Politique de branche Git conservée seulement pour les sources Git ; les résultats de fichiers n’ont aucune branche artificielle. |
| `copies`     | `readonly string[] \| undefined`                                                                                 | Selon la variante | Copies legacy de worktree Git ; utilisez les entrées de fichiers ou la sélection déclarées pour les workspaces de fichiers.      |
| `guard`      | `DiffGuard \| undefined`                                                                                         | Selon la variante | Guard de diff Git commité ; indisponible pour les workspaces dossier et éphémères.                                               |

## Signature

```ts
export type WorkspaceSource = GitWorkspaceSource | FileWorkspaceSource;
```

## Contrats associés

- [FileWorkspaceSource](../fileworkspacesource/)
- [GitWorkspaceSource](../gitworkspacesource/)
