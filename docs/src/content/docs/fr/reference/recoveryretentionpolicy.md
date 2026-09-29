---
title: "RecoveryRetentionPolicy"
description: "RecoveryRetentionPolicy — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRetentionPolicy } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                               | Présence  | Rôle                                                                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`       | `1`                                                                | Requis    | Version du format de politique ; doit valoir 1.                                                                                                                                                                                             |
| `scopes`        | `readonly ("clean-workspaces" \| "closed-logs" \| "task-cache")[]` | Requis    | Données pouvant devenir éligibles : clean-workspaces (worktrees propres sur une branche, en local seulement), closed-logs (journaux fermés) et task-cache (entrées du cache de tâches). Au moins un ; rien en dehors n’est jamais éligible. |
| `minAgeMs`      | `number`                                                           | Requis    | Délai minimal depuis la dernière modification de l’entrée, en millisecondes ; 0 accepte tout âge. Pour un journal, l’index et chaque segment doivent être assez anciens.                                                                    |
| `maxBytes`      | `number \| undefined`                                              | Optionnel | Limite de projectedBytes ; au-delà, le quota du plan vaut exceeded. Elle ne rend jamais d’autres entrées éligibles.                                                                                                                         |
| `maxWorkspaces` | `number \| undefined`                                              | Optionnel | Limite des worktrees restants après nettoyage ; au-delà, le quota du plan vaut exceeded. Elle ne rend jamais d’autres worktrees éligibles, et un transporter la rejette avec le code configuration.                                         |

## Signature

```ts
export interface RecoveryRetentionPolicy {
  readonly version: 1;
  readonly scopes: readonly (
    "clean-workspaces" | "closed-logs" | "task-cache"
  )[];
  readonly minAgeMs: number;
  readonly maxBytes?: number;
  readonly maxWorkspaces?: number;
}
```
