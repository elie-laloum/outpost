---
title: "ArtifactReference"
description: "ArtifactReference — Outpost API"
sidebar:
  order: 10
---

Public contract for **ArtifactReference**. See the [typed artifacts guide](../../workflows/artifacts/) for behavior, defaults and examples.

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

## Related contracts

- [ArtifactIdentity](../artifactidentity/)
- [ArtifactProducer](../artifactproducer/)
