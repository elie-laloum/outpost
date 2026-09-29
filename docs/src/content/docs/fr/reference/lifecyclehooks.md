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

| Nom              | Type                              | Présence  | Rôle                                                                                                                                                                                                   |
| ---------------- | --------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workspaceReady` | `readonly Command[] \| undefined` | Optionnel | Commandes hôtes exécutées après préparation du workspace, avant allocation de la sandbox.                                                                                                              |
| `hostReady`      | `readonly Command[] \| undefined` | Optionnel | Commandes hôte exécutées l'une après l'autre après l'allocation de la sandbox, en même temps que sandboxReady ; le premier échec arrête les deux groupes.                                              |
| `sandboxReady`   | `readonly Command[] \| undefined` | Optionnel | Commandes lancées ensemble dans la sandbox après l'allocation, en même temps que hostReady ; enchaînez les étapes dépendantes dans une seule commande shell. Le premier échec arrête les deux groupes. |

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
