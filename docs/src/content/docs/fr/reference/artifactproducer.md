---
title: "ArtifactProducer"
description: "ArtifactProducer — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ArtifactProducer**. Consultez le [guide artefacts typés](../../guide/advanced/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ArtifactProducer } from "@elie-laloum/outpost";
```

## Rôle et comportement

Publier des données immuables et échanger des références avec validation du contrat, de l’empreinte et de la filiation.

Les données du store fichier sont limitées à 16 Mio par défaut. L’appelant possède la rétention. L’empreinte fournit l’intégrité par rapport à une référence fiable, pas l’authentification du producteur ni une transaction commune.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom           | Type     | Présence | Rôle                                                                             |
| ------------- | -------- | -------- | -------------------------------------------------------------------------------- |
| `executionId` | `string` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `taskKey`     | `string` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `attempt`     | `number` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface ArtifactProducer {
  readonly executionId: string;
  readonly taskKey: string;
  readonly attempt: number;
}
```
