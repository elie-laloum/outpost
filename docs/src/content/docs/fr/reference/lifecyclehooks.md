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

| Nom              | Type                              | Présence  | Rôle                                                                                      |
| ---------------- | --------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `workspaceReady` | `readonly Command[] \| undefined` | Optionnel | Commandes hôtes exécutées après préparation du workspace, avant allocation de la sandbox. |
| `hostReady`      | `readonly Command[] \| undefined` | Optionnel | Commandes hôtes exécutées après acquisition de l’environnement et avant sandboxReady.     |
| `sandboxReady`   | `readonly Command[] \| undefined` | Optionnel | Commandes exécutées dans la sandbox acquise après préparation hôte.                       |

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
