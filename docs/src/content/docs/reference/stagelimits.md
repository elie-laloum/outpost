---
title: "StageLimits"
description: "StageLimits — Outpost API"
sidebar:
  order: 10
---

Public contract for **StageLimits**. See the [workspaces guide](../../sandboxes/workspaces/) for behavior, defaults and examples.

## Import

```ts
import type { StageLimits } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface StageLimits {
  readonly copyMs?: number;
  readonly gitMs?: number;
  readonly collectMs?: number;
  readonly mergeMs?: number;
}
```
