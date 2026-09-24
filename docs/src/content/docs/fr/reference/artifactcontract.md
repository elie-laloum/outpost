---
title: "ArtifactContract"
description: "ArtifactContract — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ArtifactContract**. Consultez le [guide artefacts typés](../../workflows/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ArtifactContract } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ArtifactContract<T> extends ArtifactIdentity {
  encode(value: T): Promise<Uint8Array>;
  decode(bytes: Uint8Array): Promise<T>;
}
```

## Contrats associés

- [ArtifactIdentity](../artifactidentity/)
