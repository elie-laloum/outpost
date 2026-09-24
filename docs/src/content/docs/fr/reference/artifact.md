---
title: "artifact"
description: "artifact — Outpost API"
sidebar:
  order: 10
---

Contrat public de **artifact**. Consultez le [guide artefacts typés](../../workflows/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { artifact } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare const artifact: {
  json<T>(options: JsonArtifactOptions<T>): ArtifactContract<T>;
  binary(options: ArtifactContractOptions): ArtifactContract<Uint8Array>;
};
```

## Contrats associés

- [ArtifactContract](../artifactcontract/)
- [ArtifactContractOptions](../artifactcontractoptions/)
- [JsonArtifactOptions](../jsonartifactoptions/)
