---
title: "PublishArtifactOptions"
description: "PublishArtifactOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { PublishArtifactOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                        | Présence  | Rôle                                                                                                         |
| ---------- | ------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `producer` | `ArtifactProducer`                          | Requis    | Identité enregistrée du producteur, sans authentification.                                                   |
| `parents`  | `readonly ArtifactReference[] \| undefined` | Optionnel | Références parentes ordonnées dont les identifiants sont enregistrés dans la filiation de l’artefact publié. |
| `signal`   | `AbortSignal \| undefined`                  | Optionnel | Annulation coopérative de cette opération.                                                                   |

## Signature

```ts
export interface PublishArtifactOptions {
  readonly producer: ArtifactProducer;
  readonly parents?: readonly ArtifactReference[];
  readonly signal?: AbortSignal;
}
```

## Contrats associés

- [ArtifactProducer](../artifactproducer/)
- [ArtifactReference](../artifactreference/)
