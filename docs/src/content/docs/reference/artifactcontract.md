---
title: "ArtifactContract"
description: "ArtifactContract — Outpost API"
sidebar:
  order: 10
---

Public contract for **ArtifactContract**. See the [typed artifacts guide](../../workflows/artifacts/) for behavior, defaults and examples.

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

## Related contracts

- [ArtifactIdentity](../artifactidentity/)
