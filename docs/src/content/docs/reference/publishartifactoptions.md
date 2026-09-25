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

| Name       | Type                                        | Presence | Meaning                                                                               |
| ---------- | ------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `producer` | `ArtifactProducer`                          | Required | Recorded artifact producer identity, not authentication.                              |
| `parents`  | `readonly ArtifactReference[] \| undefined` | Optional | Ordered parent references whose IDs are recorded in the published artifact’s lineage. |
| `signal`   | `AbortSignal \| undefined`                  | Optional | Cooperative cancellation for this operation.                                          |

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
