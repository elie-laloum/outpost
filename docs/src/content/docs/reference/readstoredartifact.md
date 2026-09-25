---
title: "readStoredArtifact"
description: "readStoredArtifact — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { readStoredArtifact } from "@elie-laloum/outpost";
```

## Purpose and behavior

Validate an artifact reference, load its bytes and verify contract identity, size and digest before decoding. Optional producer and parent expectations add lineage checks. Use this outside a task context or when the reference is already available.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name               | Type                                        | Presence | Meaning                                                                                |
| ------------------ | ------------------------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `store`            | `ArtifactStore`                             | Required | Artifact byte store used for immutable publication or bounded payload retrieval.       |
| `contract`         | `ArtifactContract<T>`                       | Required | Named, versioned artifact contract that defines encoding and validation.               |
| `value`            | `unknown`                                   | Required | Untrusted artifact reference to validate before loading and checking its stored bytes. |
| `options`          | `ReadArtifactOptions \| undefined`          | Optional | Expected producer and parent lineage, plus read cancellation.                          |
| `options.producer` | `ArtifactProducer \| undefined`             | Optional | Expected producer execution, task and attempt; a mismatch rejects the read.            |
| `options.parents`  | `readonly ArtifactReference[] \| undefined` | Optional | Expected ordered parent references; a mismatching lineage rejects the read.            |
| `options.signal`   | `AbortSignal \| undefined`                  | Optional | Cooperative cancellation for this operation.                                           |

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
