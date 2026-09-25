---
title: "artifact"
description: "artifact — Outpost API"
sidebar:
  order: 10
---

Public contract for **artifact**. See the [typed artifacts guide](../../guide/advanced/artifacts/) for behavior, defaults and examples.

## Import

```ts
import { artifact } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publish immutable payloads and exchange small references with contract, digest and lineage validation.

Filesystem payloads default to 16 MiB maximum. Callers own retention. Digests provide integrity against a trusted reference, not producer authentication or a shared transaction.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

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
