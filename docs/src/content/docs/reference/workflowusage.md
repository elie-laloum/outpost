---
title: "WorkflowUsage"
description: "WorkflowUsage — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowUsage**. See the [workflows guide](../../workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowUsage } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowUsage {
  readonly attempts: number;
  readonly tokens: Usage;
}
```

## Related contracts

- [Usage](../usage/)
