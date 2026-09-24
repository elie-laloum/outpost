---
title: "readArtifact"
description: "readArtifact — Outpost API"
sidebar:
  order: 10
---

Public contract for **readArtifact**. See the [typed artifacts guide](../../workflows/artifacts/) for behavior, defaults and examples.

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

## Related contracts

- [ArtifactContract](../artifactcontract/)
- [ArtifactReference](../artifactreference/)
- [ArtifactStore](../artifactstore/)
- [Task](../task/)
- [TaskContext](../taskcontext/)
