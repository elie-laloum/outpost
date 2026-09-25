---
title: "ArtifactReference"
description: "ArtifactReference — Outpost API"
sidebar:
  order: 10
---

Public contract for **ArtifactReference**. See the [typed artifacts guide](../../guide/advanced/artifacts/) for behavior, defaults and examples.

## Import

```ts
import type { ArtifactReference } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publish immutable payloads and exchange small references with contract, digest and lineage validation.

Filesystem payloads default to 16 MiB maximum. Callers own retention. Digests provide integrity against a trusted reference, not producer authentication or a shared transaction.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name       | Type                | Presence | Meaning                                                                 |
| ---------- | ------------------- | -------- | ----------------------------------------------------------------------- |
| `format`   | `1`                 | Required | See the linked contract and this family's rules for its interpretation. |
| `id`       | `string`            | Required | See the linked contract and this family's rules for its interpretation. |
| `digest`   | `string`            | Required | See the linked contract and this family's rules for its interpretation. |
| `size`     | `number`            | Required | See the linked contract and this family's rules for its interpretation. |
| `contract` | `ArtifactIdentity`  | Required | See the linked contract and this family's rules for its interpretation. |
| `producer` | `ArtifactProducer`  | Required | Recorded artifact producer identity, not authentication.                |
| `parents`  | `readonly string[]` | Required | Ordered artifact parent references or identifiers.                      |

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
