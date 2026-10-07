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

| Nom              | Type                                       | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------- | ------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspaceReady` | `readonly LifecycleCommand[] \| undefined` | Optionnel | Commandes hôte exécutées l’une après l’autre dans le worktree une fois celui-ci préparé et les copies en place, avant toute sandbox. Un échec ferme le workspace et rejette l’ouverture ; ignorées quand la sandbox reçoit un workspace déjà ouvert.                                                                                                                                                              |
| `hostReady`      | `readonly LifecycleCommand[] \| undefined` | Optionnel | Commandes hôte exécutées l’une après l’autre dans le worktree après l’allocation de chaque sandbox, en même temps que sandboxReady. Le premier échec arrête les deux groupes et l’allocation de la sandbox échoue. Avec when: changed(files), revérification avant chaque commande, dispatch ou attachement sur une sandbox réutilisée ; les empreintes réussies sont propres à cette sandbox.                    |
| `sandboxReady`   | `readonly LifecycleCommand[] \| undefined` | Optionnel | Commandes lancées ensemble dans la sandbox, à la racine du dépôt, une fois le dépôt en place, en même temps que hostReady ; enchaînez les étapes dépendantes dans une seule commande shell. Le premier échec arrête les deux groupes. Avec when: changed(files), revérification avant chaque commande, dispatch ou attachement sur une sandbox réutilisée ; les empreintes réussies sont propres à cette sandbox. |

## Signature

```ts
export interface LifecycleHooks {
  readonly workspaceReady?: readonly LifecycleCommand[];
  readonly hostReady?: readonly LifecycleCommand[];
  readonly sandboxReady?: readonly LifecycleCommand[];
}
```

## Contrats associés

- [LifecycleCommand](../lifecyclecommand/)
