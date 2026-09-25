---
title: "ReadArtifactOptions"
description: "ReadArtifactOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ReadArtifactOptions**. Consultez le [guide artefacts typés](../../guide/advanced/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ReadArtifactOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Publier des données immuables et échanger des références avec validation du contrat, de l’empreinte et de la filiation.

Les données du store fichier sont limitées à 16 Mio par défaut. L’appelant possède la rétention. L’empreinte fournit l’intégrité par rapport à une référence fiable, pas l’authentification du producteur ni une transaction commune.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom        | Type                                        | Présence  | Rôle                                                       |
| ---------- | ------------------------------------------- | --------- | ---------------------------------------------------------- |
| `producer` | `ArtifactProducer \| undefined`             | Optionnel | Identité enregistrée du producteur, sans authentification. |
| `parents`  | `readonly ArtifactReference[] \| undefined` | Optionnel | Références ou identifiants parents ordonnés.               |
| `signal`   | `AbortSignal \| undefined`                  | Optionnel | Annulation coopérative de cette opération.                 |

## Signature

```ts
export interface ReadArtifactOptions {
  readonly producer?: ArtifactProducer;
  readonly parents?: readonly ArtifactReference[];
  readonly signal?: AbortSignal;
}
```

## Contrats associés

- [ArtifactProducer](../artifactproducer/)
- [ArtifactReference](../artifactreference/)
