---
title: "ReadArtifactOptions"
description: "ReadArtifactOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReadArtifactOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                        | Présence  | Rôle                                                                                                       |
| ---------- | ------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| `producer` | `ArtifactProducer \| undefined`             | Optionnel | Exécution, clé de tâche et tentative attendues ; toute différence rejette avec Artifact producer mismatch. |
| `parents`  | `readonly ArtifactReference[] \| undefined` | Optionnel | Références parentes attendues, dans l’ordre ; une liste différente rejette avec Artifact lineage mismatch. |
| `signal`   | `AbortSignal \| undefined`                  | Optionnel | Son annulation rejette la lecture avec la raison du signal.                                                |

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
