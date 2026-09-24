---
title: "artifact"
description: "artifact — Outpost API"
sidebar:
  order: 10
---

Public contract for **artifact**. See the [typed artifacts guide](../../workflows/artifacts/) for behavior, defaults and examples.

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

## Related contracts

- [ArtifactContract](../artifactcontract/)
- [ArtifactContractOptions](../artifactcontractoptions/)
- [JsonArtifactOptions](../jsonartifactoptions/)
