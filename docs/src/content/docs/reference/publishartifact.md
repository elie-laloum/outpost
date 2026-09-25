---
title: "publishArtifact"
description: "publishArtifact — Outpost API"
sidebar:
  order: 10
---

Public contract for **publishArtifact**. See the [typed artifacts guide](../../guide/advanced/artifacts/) for behavior, defaults and examples.

## Import

```ts
import { publishArtifact } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publish immutable payloads and exchange small references with contract, digest and lineage validation.

Filesystem payloads default to 16 MiB maximum. Callers own retention. Digests provide integrity against a trusted reference, not producer authentication or a shared transaction.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name               | Type                                        | Presence | Meaning                                                                                  |
| ------------------ | ------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `store`            | `ArtifactStore`                             | Required | Caller-supplied persistence implementation.                                              |
| `contract`         | `ArtifactContract<T>`                       | Required | See the linked contract and this family's rules for its interpretation.                  |
| `value`            | `T`                                         | Required | Typed value produced or consumed by this contract.                                       |
| `options`          | `PublishArtifactOptions`                    | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.producer` | `ArtifactProducer`                          | Required | Recorded artifact producer identity, not authentication.                                 |
| `options.parents`  | `readonly ArtifactReference[] \| undefined` | Optional | Ordered artifact parent references or identifiers.                                       |
| `options.signal`   | `AbortSignal \| undefined`                  | Optional | Cooperative cancellation for this operation.                                             |

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
