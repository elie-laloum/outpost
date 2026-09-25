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

| Nom        | Type                                        | Présence  | Rôle                                                                                          |
| ---------- | ------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `producer` | `ArtifactProducer \| undefined`             | Optionnel | Exécution, tâche et tentative du producteur attendu ; une différence fait échouer la lecture. |
| `parents`  | `readonly ArtifactReference[] \| undefined` | Optionnel | Références parentes ordonnées attendues ; une filiation différente fait échouer la lecture.   |
| `signal`   | `AbortSignal \| undefined`                  | Optionnel | Annulation coopérative de cette opération.                                                    |

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
