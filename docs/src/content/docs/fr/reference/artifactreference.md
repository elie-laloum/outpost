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

| Nom        | Type                | Présence | Rôle                                                                                                     |
| ---------- | ------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `format`   | `1`                 | Requis   | Version du format des métadonnées de référence d’artefact ; actuellement 1.                              |
| `id`       | `string`            | Requis   | Identité adressée par contenu déduite de l’empreinte, du contrat, du producteur et des parents ordonnés. |
| `digest`   | `string`            | Requis   | Empreinte SHA-256 des octets encodés de l’artefact.                                                      |
| `size`     | `number`            | Requis   | Longueur exacte en octets des données encodées de l’artefact.                                            |
| `contract` | `ArtifactIdentity`  | Requis   | Contrat d’artefact nommé et versionné définissant encodage et validation.                                |
| `producer` | `ArtifactProducer`  | Requis   | Identité enregistrée du producteur, sans authentification.                                               |
| `parents`  | `readonly string[]` | Requis   | Identifiants immuables ordonnés des références parentes de l’artefact.                                   |

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
