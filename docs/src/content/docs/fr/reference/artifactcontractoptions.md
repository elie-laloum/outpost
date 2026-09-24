---
title: "ArtifactContractOptions"
description: "ArtifactContractOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ArtifactContractOptions**. Consultez le [guide artefacts typés](../../workflows/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ArtifactContractOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export type ArtifactContractOptions = Pick<
  ArtifactIdentity,
  "name" | "version"
>;
```

## Contrats associés

- [ArtifactIdentity](../artifactidentity/)
