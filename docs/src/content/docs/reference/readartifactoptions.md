---
title: "ReadArtifactOptions"
description: "ReadArtifactOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **ReadArtifactOptions**. See the [typed artifacts guide](../../guide/advanced/artifacts/) for behavior, defaults and examples.

## Import

```ts
import type { ReadArtifactOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publish immutable payloads and exchange small references with contract, digest and lineage validation.

Filesystem payloads default to 16 MiB maximum. Callers own retention. Digests provide integrity against a trusted reference, not producer authentication or a shared transaction.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name       | Type                                        | Presence | Meaning                                                  |
| ---------- | ------------------------------------------- | -------- | -------------------------------------------------------- |
| `producer` | `ArtifactProducer \| undefined`             | Optional | Recorded artifact producer identity, not authentication. |
| `parents`  | `readonly ArtifactReference[] \| undefined` | Optional | Ordered artifact parent references or identifiers.       |
| `signal`   | `AbortSignal \| undefined`                  | Optional | Cooperative cancellation for this operation.             |

## Signature

```ts
export interface ReadArtifactOptions {
  readonly producer?: ArtifactProducer;
  readonly parents?: readonly ArtifactReference[];
  readonly signal?: AbortSignal;
}
```

## Related contracts

- [ArtifactProducer](../artifactproducer/)
- [ArtifactReference](../artifactreference/)
