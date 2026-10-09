---
title: "GitWorkspaceSource"
description: "GitWorkspaceSource — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GitWorkspaceSource } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                             | Présence  | Rôle                                                                                                                             |
| ------------ | -------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"git"`                          | Requis    | Discriminant sélectionnant Git, une source dossier ou un workspace initialement vide.                                            |
| `repository` | `string \| undefined`            | Optionnel | Emplacement du dépôt Git ; les modes de fichiers refusent cette option avant allocation.                                         |
| `branch`     | `BranchPolicy \| undefined`      | Optionnel | Politique de branche Git conservée seulement pour les sources Git ; les résultats de fichiers n’ont aucune branche artificielle. |
| `copies`     | `readonly string[] \| undefined` | Optionnel | Copies legacy de worktree Git ; utilisez les entrées de fichiers ou la sélection déclarées pour les workspaces de fichiers.      |
| `guard`      | `DiffGuard \| undefined`         | Optionnel | Guard de diff Git commité ; indisponible pour les workspaces dossier et éphémères.                                               |

## Signature

```ts
export interface GitWorkspaceSource {
  readonly kind: "git";
  readonly repository?: string;
  readonly branch?: BranchPolicy;
  readonly copies?: readonly string[];
  readonly guard?: DiffGuard;
}
```

## Contrats associés

- [BranchPolicy](../branchpolicy/)
- [DiffGuard](../diffguard/)
