---
title: "ArtifactReference"
description: "ArtifactReference — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ArtifactReference } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                | Presence | Meaning                                                                                             |
| ---------- | ------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `format`   | `1`                 | Required | Artifact-reference metadata format version; currently 1.                                            |
| `id`       | `string`            | Required | Content-addressed identity derived from the payload digest, contract, producer and ordered parents. |
| `digest`   | `string`            | Required | SHA-256 digest of the encoded artifact bytes.                                                       |
| `size`     | `number`            | Required | Exact byte length of the encoded artifact payload.                                                  |
| `contract` | `ArtifactIdentity`  | Required | Named, versioned artifact contract that defines encoding and validation.                            |
| `producer` | `ArtifactProducer`  | Required | Recorded artifact producer identity, not authentication.                                            |
| `parents`  | `readonly string[]` | Required | Ordered immutable IDs of the artifact’s parent references.                                          |

## Signature

```ts
export interface ArtifactReference {
  readonly format: 1;
  readonly id: string;
  readonly digest: string;
  readonly size: number;
  readonly contract: ArtifactIdentity;
  readonly producer: ArtifactProducer;
  readonly parents: readonly string[];
}
```

## Related contracts

- [ArtifactIdentity](../artifactidentity/)
- [ArtifactProducer](../artifactproducer/)
