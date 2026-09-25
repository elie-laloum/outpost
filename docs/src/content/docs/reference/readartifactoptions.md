---
title: "ReadArtifactOptions"
description: "ReadArtifactOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReadArtifactOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                        | Presence | Meaning                                                                     |
| ---------- | ------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| `producer` | `ArtifactProducer \| undefined`             | Optional | Expected producer execution, task and attempt; a mismatch rejects the read. |
| `parents`  | `readonly ArtifactReference[] \| undefined` | Optional | Expected ordered parent references; a mismatching lineage rejects the read. |
| `signal`   | `AbortSignal \| undefined`                  | Optional | Cooperative cancellation for this operation.                                |

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
