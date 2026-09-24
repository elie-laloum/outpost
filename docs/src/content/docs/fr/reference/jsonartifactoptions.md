---
title: "JsonArtifactOptions"
description: "JsonArtifactOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **JsonArtifactOptions**. Consultez le [guide artefacts typés](../../workflows/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { JsonArtifactOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export type JsonArtifactOptions<T> = ArtifactContractOptions & {
  readonly schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
};
```

## Contrats associés

- [ArtifactContractOptions](../artifactcontractoptions/)
- [StandardValidator](../standardvalidator/)
