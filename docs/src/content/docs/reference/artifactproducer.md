---
title: "ArtifactProducer"
description: "ArtifactProducer — Outpost API"
sidebar:
  order: 10
---

Public contract for **ArtifactProducer**. See the [typed artifacts guide](../../guide/advanced/artifacts/) for behavior, defaults and examples.

## Import

```ts
import type { ArtifactProducer } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publish immutable payloads and exchange small references with contract, digest and lineage validation.

Filesystem payloads default to 16 MiB maximum. Callers own retention. Digests provide integrity against a trusted reference, not producer authentication or a shared transaction.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name          | Type     | Presence | Meaning                                                                 |
| ------------- | -------- | -------- | ----------------------------------------------------------------------- |
| `executionId` | `string` | Required | See the linked contract and this family's rules for its interpretation. |
| `taskKey`     | `string` | Required | See the linked contract and this family's rules for its interpretation. |
| `attempt`     | `number` | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface ArtifactProducer {
  readonly executionId: string;
  readonly taskKey: string;
  readonly attempt: number;
}
```
