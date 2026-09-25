---
title: "ArtifactProducer"
description: "ArtifactProducer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ArtifactProducer } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type     | Presence | Meaning                                                                     |
| ------------- | -------- | -------- | --------------------------------------------------------------------------- |
| `executionId` | `string` | Required | Identity of the workflow execution, preserved across checkpoint resumption. |
| `taskKey`     | `string` | Required | Key of the workflow task that published the artifact.                       |
| `attempt`     | `number` | Required | One-based task attempt number.                                              |

## Signature

```ts
export interface ArtifactProducer {
  readonly executionId: string;
  readonly taskKey: string;
  readonly attempt: number;
}
```
