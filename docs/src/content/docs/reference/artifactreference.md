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

| Name       | Type                | Presence | Meaning                                                                                                                                               |
| ---------- | ------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`   | `1`                 | Required | Reference format version, always 1.                                                                                                                   |
| `id`       | `string`            | Required | Content-addressed id: SHA-256 of the format, digest, size, contract, producer and ordered parents. Reads recompute it and reject an edited reference. |
| `digest`   | `string`            | Required | SHA-256 of the stored bytes, in lowercase hexadecimal. Reads reject bytes with another digest.                                                        |
| `size`     | `number`            | Required | Byte length of the stored payload. Reads reject bytes of another length.                                                                              |
| `contract` | `ArtifactIdentity`  | Required | Name, version and encoding of the contract that encoded the payload. A read with another contract rejects with Artifact contract mismatch.            |
| `producer` | `ArtifactProducer`  | Required | Execution, task and attempt that published the artifact, as declared by the publisher; not authenticated.                                             |
| `parents`  | `readonly string[]` | Required | Ids of the parent artifacts, in the order given at publication, without duplicates.                                                                   |

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
