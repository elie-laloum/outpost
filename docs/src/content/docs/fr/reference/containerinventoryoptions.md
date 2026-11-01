---
title: "ContainerInventoryOptions"
description: "ContainerInventoryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

Choisissez un seul de ces imports équivalents.

```ts
import type { ContainerInventoryOptions } from "@elie-laloum/outpost/providers/docker";
```

```ts
import type { ContainerInventoryOptions } from "@elie-laloum/outpost/providers/podman";
```

## Paramètres et propriétés

| Nom          | Type                       | Présence  | Rôle                                                                                             |
| ------------ | -------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `signal`     | `AbortSignal \| undefined` | Optionnel | Annulation coopérative ; l’abandon arrête la commande du moteur en cours et rejette l’opération. |
| `deadlineMs` | `number \| undefined`      | Optionnel | Durée maximale en millisecondes de chaque commande du moteur, 10000 par défaut.                  |

## Signature

```ts
export interface ContainerInventoryOptions {
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}
```
