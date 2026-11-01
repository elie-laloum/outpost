---
title: "ContainerSandboxQuery"
description: "ContainerSandboxQuery — Outpost API"
sidebar:
  order: 20
---

## Import

Choisissez un seul de ces imports équivalents.

```ts
import type { ContainerSandboxQuery } from "@elie-laloum/outpost/providers/docker";
```

```ts
import type { ContainerSandboxQuery } from "@elie-laloum/outpost/providers/podman";
```

## Paramètres et propriétés

| Nom          | Type                               | Présence  | Rôle                                                                                                                                                                                                       |
| ------------ | ---------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `labels`     | `Readonly<Record<string, string>>` | Requis    | Labels que chaque sandbox rapportée doit porter, selon les règles de ContainerLabels. Au moins un label est requis, afin qu’une requête ne puisse pas sélectionner toutes les sandboxes Outpost de l’hôte. |
| `signal`     | `AbortSignal \| undefined`         | Optionnel | Annulation coopérative ; l’abandon arrête la commande du moteur en cours et rejette l’opération.                                                                                                           |
| `deadlineMs` | `number \| undefined`              | Optionnel | Durée maximale en millisecondes de chaque commande du moteur, 10000 par défaut.                                                                                                                            |

## Signature

```ts
export interface ContainerSandboxQuery extends ContainerInventoryOptions {
  readonly labels: ContainerLabels;
}
```

## Contrats associés

- [ContainerInventoryOptions](../containerinventoryoptions/)
- [ContainerLabels](../containerlabels/)
