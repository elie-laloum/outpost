---
title: "artifactTask"
description: "artifactTask — Outpost API"
sidebar:
  order: 10
---

Contrat public de **artifactTask**. Consultez le [guide artefacts typés](../../workflows/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { artifactTask } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function artifactTask<T>(
  options: ArtifactTaskOptions<T>,
): Task<ArtifactReference>;
```

## Contrats associés

- [ArtifactReference](../artifactreference/)
- [ArtifactTaskOptions](../artifacttaskoptions/)
- [Task](../task/)
