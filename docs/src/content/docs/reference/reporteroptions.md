---
title: "ReporterOptions"
description: "ReporterOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **ReporterOptions**. See the [observability guide](../../agents/observability/) for behavior, defaults and examples.

## Import

```ts
import type { ReporterOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ReporterOptions {
  readonly label?: string;
  readonly verbose?: boolean;
  readonly quiet?: boolean;
  readonly write?: (text: string) => void;
}
```
