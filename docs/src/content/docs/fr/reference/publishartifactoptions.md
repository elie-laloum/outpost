---
title: "PublishArtifactOptions"
description: "PublishArtifactOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **PublishArtifactOptions**. Consultez le [guide artefacts typés](../../workflows/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { PublishArtifactOptions } from "@elie-laloum/outpost";
```

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
