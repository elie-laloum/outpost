---
title: "publishArtifact"
description: "publishArtifact — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { publishArtifact } from "@elie-laloum/outpost";
```

## Purpose and behavior

Encode a value with its contract, compute its digest and immutable identity, then atomically put its bytes in the store. Return a small reference containing producer and ordered parent lineage; producer metadata is not authentication.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name               | Type                                        | Presence | Meaning                                                                               |
| ------------------ | ------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `store`            | `ArtifactStore`                             | Required | Artifact byte store used for immutable publication or bounded payload retrieval.      |
| `contract`         | `ArtifactContract<T>`                       | Required | Named, versioned artifact contract that defines encoding and validation.              |
| `value`            | `T`                                         | Required | Typed payload to validate, encode and publish through the artifact contract.          |
| `options`          | `PublishArtifactOptions`                    | Required | Producer identity, ordered parent lineage and publication cancellation.               |
| `options.producer` | `ArtifactProducer`                          | Required | Recorded artifact producer identity, not authentication.                              |
| `options.parents`  | `readonly ArtifactReference[] \| undefined` | Optional | Ordered parent references whose IDs are recorded in the published artifact’s lineage. |
| `options.signal`   | `AbortSignal \| undefined`                  | Optional | Cooperative cancellation for this operation.                                          |

## Returns

`Promise<ArtifactReference>`

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
