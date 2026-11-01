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

| Nom          | Type                               | Présence  | Rôle                                                                                                                                                                                                                                                                                                 |
| ------------ | ---------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `labels`     | `Readonly<Record<string, string>>` | Requis    | Labels que chaque sandbox rapportée doit porter, selon les règles de ContainerLabels ; un sélecteur invalide échoue avec une ConfigurationError avant toute commande du moteur. Au moins un label est requis, afin qu’une requête ne puisse pas sélectionner toutes les sandboxes Outpost de l’hôte. |
| `signal`     | `AbortSignal \| undefined`         | Optionnel | Annulation coopérative de toute la liste ; l’abandon arrête la commande du moteur en cours et rejette avec la raison du signal.                                                                                                                                                                      |
| `deadlineMs` | `number \| undefined`              | Optionnel | Durée maximale en millisecondes de toute la liste, nouvelles tentatives comprises, 10000 par défaut ; au-delà, la liste rejette avec le code timeout.                                                                                                                                                |

## Signature

```ts
export interface ContainerSandboxQuery extends TransferOptions {
  readonly labels: ContainerLabels;
}
```

## Contrats associés

- [ContainerLabels](../containerlabels/)
- [TransferOptions](../transferoptions/)
