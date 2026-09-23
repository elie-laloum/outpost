---
title: "Assignment"
description: "Assignment — Outpost API"
sidebar:
  order: 10
---

Public contract for **Assignment**. See the [campaigns and backlogs guide](../../workflows/campaigns/) for behavior, defaults and examples.

## Import

```ts
import type { Assignment } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Assignment {
  readonly id: string;
  readonly branch: string;
}
```
