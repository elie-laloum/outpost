---
title: "Logging"
description: "Logging — Outpost API"
sidebar:
  order: 10
---

Public contract for **Logging**. See the [observability guide](../../guide/agents/observability/) for behavior, defaults and examples.

## Import

```ts
import type { Logging } from "@elie-laloum/outpost";
```

## Purpose and behavior

Observe progress, log execution and account for reported usage without changing task outcomes.

Observer failures are isolated. Token counts are not prices. The optional OpenTelemetry entry point loads its vendor API separately from core imports.

[Complete example and detailed rules](../../guide/agents/observability/).

## Parameters and properties

| Name      | Type                                                  | Presence | Meaning                                              |
| --------- | ----------------------------------------------------- | -------- | ---------------------------------------------------- |
| `valueOf` | `(() => string) \| (() => boolean) \| (() => Object)` | Required | Returns the primitive value of the specified object. |

## Signature

```ts
export type Logging =
  | false
  | "stdout"
  | {
      readonly file?: string;
      readonly verbose?: boolean;
    };
```
