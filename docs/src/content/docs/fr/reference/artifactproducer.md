---
title: "ArtifactProducer"
description: "ArtifactProducer — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ArtifactProducer**. Consultez le [guide artefacts typés](../../workflows/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ArtifactProducer } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ArtifactProducer {
  readonly executionId: string;
  readonly taskKey: string;
  readonly attempt: number;
}
```
