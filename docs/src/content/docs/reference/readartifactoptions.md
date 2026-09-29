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

| Name       | Type                                        | Presence | Meaning                                                                                           |
| ---------- | ------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `producer` | `ArtifactProducer \| undefined`             | Optional | Expected execution, task key and attempt; any difference rejects with Artifact producer mismatch. |
| `parents`  | `readonly ArtifactReference[] \| undefined` | Optional | Expected parent references, in order; a different list rejects with Artifact lineage mismatch.    |
| `signal`   | `AbortSignal \| undefined`                  | Optional | Aborting it rejects the read with the signal's reason.                                            |

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
