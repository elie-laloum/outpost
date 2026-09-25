---
title: "ArtifactReference"
description: "ArtifactReference — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ArtifactReference**. Consultez le [guide artefacts typés](../../guide/advanced/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ArtifactReference } from "@elie-laloum/outpost";
```

## Rôle et comportement

Publier des données immuables et échanger des références avec validation du contrat, de l’empreinte et de la filiation.

Les données du store fichier sont limitées à 16 Mio par défaut. L’appelant possède la rétention. L’empreinte fournit l’intégrité par rapport à une référence fiable, pas l’authentification du producteur ni une transaction commune.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom        | Type                | Présence | Rôle                                                                             |
| ---------- | ------------------- | -------- | -------------------------------------------------------------------------------- |
| `format`   | `1`                 | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `id`       | `string`            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `digest`   | `string`            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `size`     | `number`            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `contract` | `ArtifactIdentity`  | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `producer` | `ArtifactProducer`  | Requis   | Identité enregistrée du producteur, sans authentification.                       |
| `parents`  | `readonly string[]` | Requis   | Références ou identifiants parents ordonnés.                                     |

## Signature

```ts
export interface ArtifactReference {
  readonly format: 1;
  readonly id: string;
  readonly digest: string;
  readonly size: number;
  readonly contract: ArtifactIdentity;
  readonly producer: ArtifactProducer;
  readonly parents: readonly string[];
}
```

## Contrats associés

- [ArtifactIdentity](../artifactidentity/)
- [ArtifactProducer](../artifactproducer/)
