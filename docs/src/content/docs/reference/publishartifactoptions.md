---
title: "PublishArtifactOptions"
description: "PublishArtifactOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { PublishArtifactOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                        | Presence | Meaning                                                                                                                                                           |
| ---------- | ------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `producer` | `ArtifactProducer`                          | Required | Execution, task key and attempt recorded in the reference and its id, as given: Outpost does not authenticate them.                                               |
| `parents`  | `readonly ArtifactReference[] \| undefined` | Optional | References this artifact was derived from, in order; their ids are recorded in parents and in the id. An invalid or duplicated reference rejects the publication. |
| `signal`   | `AbortSignal \| undefined`                  | Optional | Aborting it rejects the publication with the signal's reason; bytes already stored are kept.                                                                      |

## Signature

```ts
export interface PublishArtifactOptions {
  readonly producer: ArtifactProducer;
  readonly parents?: readonly ArtifactReference[];
  readonly signal?: AbortSignal;
}
```

## Related contracts

- [ArtifactProducer](../artifactproducer/)
- [ArtifactReference](../artifactreference/)
