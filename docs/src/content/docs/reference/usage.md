---
title: "Usage"
description: "Usage — Outpost API"
sidebar:
  order: 10
---

Public contract for **Usage**. See the [observability guide](../../agents/observability/) for behavior, defaults and examples.

## Import

```ts
import type { Usage } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Usage {
  readonly input: number;
  readonly cached: number;
  readonly cacheCreated?: number;
  readonly output: number;
}
```
