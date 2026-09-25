---
title: "WorkflowTelemetry"
description: "WorkflowTelemetry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowTelemetry } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                             | Presence | Meaning                                                                                                                                                                                                            |
| --------- | -------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `observe` | `(event: WorkflowEvent) => void` | Required | Synchronously receive each workflow lifecycle and usage event with the adapter as receiver. Thrown errors are collected in WorkflowResult.observerErrors without affecting tasks or the separate observe callback. |

## Signature

```ts
export interface WorkflowTelemetry {
  observe(event: WorkflowEvent): void;
}
```

## Related contracts

- [WorkflowEvent](../workflowevent/)
