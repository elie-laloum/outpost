---
title: "ArtifactReference"
description: "ArtifactReference — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ArtifactReference**. Consultez le [guide artefacts typés](../../workflows/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ArtifactReference } from "@elie-laloum/outpost";
```

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
