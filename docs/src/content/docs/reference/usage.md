---
title: "Usage"
description: "Usage — Outpost API"
sidebar:
  order: 10
---

Public contract for **Usage**. See the [observability guide](../../guide/agents/observability/) for behavior, defaults and examples.

## Import

```ts
import type { Usage } from "@elie-laloum/outpost";
```

## Purpose and behavior

Observe progress, log execution and account for reported usage without changing task outcomes.

Observer failures are isolated. Token counts are not prices. The optional OpenTelemetry entry point loads its vendor API separately from core imports.

[Complete example and detailed rules](../../guide/agents/observability/).

## Parameters and properties

| Name           | Type                  | Presence | Meaning                                                                 |
| -------------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `input`        | `number`              | Required | See the linked contract and this family's rules for its interpretation. |
| `cached`       | `number`              | Required | See the linked contract and this family's rules for its interpretation. |
| `cacheCreated` | `number \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `output`       | `number`              | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface Usage {
  readonly input: number;
  readonly cached: number;
  readonly cacheCreated?: number;
  readonly output: number;
}
```
