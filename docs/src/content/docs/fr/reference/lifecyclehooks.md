---
title: "LifecycleHooks"
description: "LifecycleHooks — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { LifecycleHooks } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                              | Présence  | Rôle                                                                                                                                                                                                                                                 |
| ---------------- | --------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspaceReady` | `readonly Command[] \| undefined` | Optionnel | Commandes hôte exécutées l’une après l’autre dans le worktree une fois celui-ci préparé et les copies en place, avant toute sandbox. Un échec ferme le workspace et rejette l’ouverture ; ignorées quand la sandbox reçoit un workspace déjà ouvert. |
| `hostReady`      | `readonly Command[] \| undefined` | Optionnel | Commandes hôte exécutées l’une après l’autre dans le worktree après l’allocation de chaque sandbox, en même temps que sandboxReady. Le premier échec arrête les deux groupes et l’allocation de la sandbox échoue.                                   |
| `sandboxReady`   | `readonly Command[] \| undefined` | Optionnel | Commandes lancées ensemble dans la sandbox, à la racine du dépôt, une fois le dépôt en place, en même temps que hostReady ; enchaînez les étapes dépendantes dans une seule commande shell. Le premier échec arrête les deux groupes.                |

## Signature

```ts
export interface LifecycleHooks {
  readonly workspaceReady?: readonly Command[];
  readonly hostReady?: readonly Command[];
  readonly sandboxReady?: readonly Command[];
}
```

## Contrats associés

- [Command](../command/)
