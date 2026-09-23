---
title: "Volume"
description: "Volume — Outpost API"
sidebar:
  order: 10
---

Public contract for **Volume**. See the [providers guide](../../providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { Volume } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Volume {
  readonly source: string;
  readonly target: string;
  readonly readOnly?: boolean;
}
```
