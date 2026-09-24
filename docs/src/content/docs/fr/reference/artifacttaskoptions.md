---
title: "ArtifactTaskOptions"
description: "ArtifactTaskOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ArtifactTaskOptions**. Consultez le [guide artefacts typés](../../workflows/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ArtifactTaskOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export type ArtifactTaskOptions<T> = Omit<
  TaskOptions<ArtifactReference>,
  "perform"
> & {
  readonly store: ArtifactStore;
  readonly contract: ArtifactContract<T>;
  readonly produce: (context: TaskContext) => T | Promise<T>;
  readonly parents?: (context: TaskContext) => readonly ArtifactReference[];
};
```

## Contrats associés

- [ArtifactContract](../artifactcontract/)
- [ArtifactReference](../artifactreference/)
- [ArtifactStore](../artifactstore/)
- [TaskContext](../taskcontext/)
- [TaskOptions](../taskoptions/)
