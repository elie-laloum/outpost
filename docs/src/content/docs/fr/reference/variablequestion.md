---
title: "VariableQuestion"
description: "VariableQuestion — Outpost API"
sidebar:
  order: 10
---

Contrat public de **VariableQuestion**. Consultez le [guide commandes et terminal](../../guide/environment/commands/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { VariableQuestion } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécuter un processus ou attacher une session interactive native avec possession explicite des flux.

Command renvoie les statuts non nuls ; l’appelant doit les vérifier. Attach exige un provider interactif compatible. Vercel rejette l’attachement.

[Exemple complet et règles détaillées](../../guide/environment/commands/).

## Retour

`Promise<string>`

## Signature

```ts
export type VariableQuestion = (
  key: string,
  signal?: AbortSignal,
) => Promise<string>;
```
