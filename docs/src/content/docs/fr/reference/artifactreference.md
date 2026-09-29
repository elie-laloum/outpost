---
title: "ArtifactReference"
description: "ArtifactReference — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ArtifactReference } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                | Présence | Rôle                                                                                                                                                                                          |
| ---------- | ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`   | `1`                 | Requis   | Version du format de référence, toujours 1.                                                                                                                                                   |
| `id`       | `string`            | Requis   | Id adressé par contenu : SHA-256 du format, de l’empreinte, de la taille, du contrat, du producteur et des parents ordonnés. Les lectures le recalculent et rejettent une référence modifiée. |
| `digest`   | `string`            | Requis   | SHA-256 des octets stockés, en hexadécimal minuscule. Les lectures rejettent des octets d’une autre empreinte.                                                                                |
| `size`     | `number`            | Requis   | Longueur en octets des données stockées. Les lectures rejettent des octets d’une autre longueur.                                                                                              |
| `contract` | `ArtifactIdentity`  | Requis   | Nom, version et encodage du contrat qui a encodé les données. Une lecture avec un autre contrat rejette avec Artifact contract mismatch.                                                      |
| `producer` | `ArtifactProducer`  | Requis   | Exécution, tâche et tentative qui ont publié l’artefact, telles que déclarées à la publication ; non authentifiées.                                                                           |
| `parents`  | `readonly string[]` | Requis   | Ids des artefacts parents, dans l’ordre donné à la publication, sans doublon.                                                                                                                 |

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
