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

Validate an untrusted reference, check its contract and any expected producer and parents, then load the bytes and verify their size and SHA-256 digest before decoding. Each mismatch rejects with an error naming it, such as Artifact contract mismatch. Use it outside a task, for example in another process.

[Complete example and detailed rules](../../guide/artifacts/).

## Parameters and properties

| Name               | Type                                        | Presence | Meaning                                                                                                           |
| ------------------ | ------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `store`            | `ArtifactStore`                             | Required | Store holding the artifact bytes.                                                                                 |
| `contract`         | `ArtifactContract<T>`                       | Required | Expected contract: its name, version and encoding must match the reference, and it decodes the bytes.             |
| `value`            | `unknown`                                   | Required | Reference to read, typically parsed from JSON. It is validated and its id recomputed before any bytes are loaded. |
| `options`          | `ReadArtifactOptions \| undefined`          | Optional | Expected producer and parents, and a cancellation signal.                                                         |
| `options.producer` | `ArtifactProducer \| undefined`             | Optional | Expected execution, task key and attempt; any difference rejects with Artifact producer mismatch.                 |
| `options.parents`  | `readonly ArtifactReference[] \| undefined` | Optional | Expected parent references, in order; a different list rejects with Artifact lineage mismatch.                    |
| `options.signal`   | `AbortSignal \| undefined`                  | Optional | Aborting it rejects the read with the signal's reason.                                                            |

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
