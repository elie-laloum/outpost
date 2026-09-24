---
title: "readArtifact"
description: "readArtifact — Outpost API"
sidebar:
  order: 10
---

Contrat public de **readArtifact**. Consultez le [guide artefacts typés](../../workflows/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { readArtifact } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function readArtifact<T>(
  context: TaskContext,
  dependency: Task<ArtifactReference>,
  contract: ArtifactContract<T>,
  store: ArtifactStore,
): Promise<T>;
```

## Contrats associés

- [ArtifactContract](../artifactcontract/)
- [ArtifactReference](../artifactreference/)
- [ArtifactStore](../artifactstore/)
- [Task](../task/)
- [TaskContext](../taskcontext/)
