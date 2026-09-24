---
title: "ArtifactProducer"
description: "ArtifactProducer — Outpost API"
sidebar:
  order: 10
---

Public contract for **ArtifactProducer**. See the [typed artifacts guide](../../workflows/artifacts/) for behavior, defaults and examples.

## Import

```ts
import type { ArtifactProducer } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ArtifactProducer {
  readonly executionId: string;
  readonly taskKey: string;
  readonly attempt: number;
}
```
