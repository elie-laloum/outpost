---
title: "publishArtifact"
description: "publishArtifact — Outpost API"
sidebar:
  order: 10
---

Contrat public de **publishArtifact**. Consultez le [guide artefacts typés](../../workflows/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { publishArtifact } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function publishArtifact<T>(
  store: ArtifactStore,
  contract: ArtifactContract<T>,
  value: T,
  options: PublishArtifactOptions,
): Promise<ArtifactReference>;
```

## Contrats associés

- [ArtifactContract](../artifactcontract/)
- [ArtifactReference](../artifactreference/)
- [ArtifactStore](../artifactstore/)
- [PublishArtifactOptions](../publishartifactoptions/)
