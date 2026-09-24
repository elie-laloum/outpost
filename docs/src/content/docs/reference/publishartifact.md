---
title: "publishArtifact"
description: "publishArtifact — Outpost API"
sidebar:
  order: 10
---

Public contract for **publishArtifact**. See the [typed artifacts guide](../../workflows/artifacts/) for behavior, defaults and examples.

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

## Related contracts

- [ArtifactContract](../artifactcontract/)
- [ArtifactReference](../artifactreference/)
- [ArtifactStore](../artifactstore/)
- [PublishArtifactOptions](../publishartifactoptions/)
