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

Encode a value with its contract, compute its SHA-256 digest and content-addressed id, then store the bytes with store.put(). Returns the ArtifactReference; producer and parents are recorded as given, not authenticated. Rejects when encoding fails, a parent reference is invalid or the store refuses the bytes.

[Complete example and detailed rules](../../guide/artifacts/).

## Parameters and properties

| Name               | Type                                        | Presence | Meaning                                                                                                                                                           |
| ------------------ | ------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `store`            | `ArtifactStore`                             | Required | Store that receives the encoded bytes under the artifact id.                                                                                                      |
| `contract`         | `ArtifactContract<T>`                       | Required | Contract that validates and encodes the value; its name, version and encoding are recorded in the reference.                                                      |
| `value`            | `T`                                         | Required | Value to publish; the contract validates it before encoding.                                                                                                      |
| `options`          | `PublishArtifactOptions`                    | Required | Producer to record, ordered parent references and cancellation signal.                                                                                            |
| `options.producer` | `ArtifactProducer`                          | Required | Execution, task key and attempt recorded in the reference and its id, as given: Outpost does not authenticate them.                                               |
| `options.parents`  | `readonly ArtifactReference[] \| undefined` | Optional | References this artifact was derived from, in order; their ids are recorded in parents and in the id. An invalid or duplicated reference rejects the publication. |
| `options.signal`   | `AbortSignal \| undefined`                  | Optional | Aborting it rejects the publication with the signal's reason; bytes already stored are kept.                                                                      |

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
