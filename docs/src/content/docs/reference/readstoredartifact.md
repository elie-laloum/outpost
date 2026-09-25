---
title: "readStoredArtifact"
description: "readStoredArtifact — Outpost API"
sidebar:
  order: 10
---

Public contract for **readStoredArtifact**. See the [typed artifacts guide](../../guide/advanced/artifacts/) for behavior, defaults and examples.

## Import

```ts
import { readStoredArtifact } from "@elie-laloum/outpost";
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
| `value`            | `unknown`                                   | Required | Typed value produced or consumed by this contract.                                       |
| `options`          | `ReadArtifactOptions \| undefined`          | Optional | Configuration object. Its fields are described in the associated options contract below. |
| `options.producer` | `ArtifactProducer \| undefined`             | Optional | Recorded artifact producer identity, not authentication.                                 |
| `options.parents`  | `readonly ArtifactReference[] \| undefined` | Optional | Ordered artifact parent references or identifiers.                                       |
| `options.signal`   | `AbortSignal \| undefined`                  | Optional | Cooperative cancellation for this operation.                                             |

## Returns

`Promise<T>`

## Signature

```ts
export declare function readStoredArtifact<T>(
  store: ArtifactStore,
  contract: ArtifactContract<T>,
  value: unknown,
  options?: ReadArtifactOptions,
): Promise<T>;
```

## Related contracts

- [ArtifactContract](../artifactcontract/)
- [ArtifactStore](../artifactstore/)
- [ReadArtifactOptions](../readartifactoptions/)
