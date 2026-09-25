---
title: "ReporterOptions"
description: "ReporterOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **ReporterOptions**. See the [observability guide](../../guide/agents/observability/) for behavior, defaults and examples.

## Import

```ts
import type { ReporterOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Observe progress, log execution and account for reported usage without changing task outcomes.

Observer failures are isolated. Token counts are not prices. The optional OpenTelemetry entry point loads its vendor API separately from core imports.

[Complete example and detailed rules](../../guide/agents/observability/).

## Parameters and properties

| Name      | Type                                    | Presence | Meaning                                                                 |
| --------- | --------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `label`   | `string \| undefined`                   | Optional | See the linked contract and this family's rules for its interpretation. |
| `verbose` | `boolean \| undefined`                  | Optional | See the linked contract and this family's rules for its interpretation. |
| `quiet`   | `boolean \| undefined`                  | Optional | See the linked contract and this family's rules for its interpretation. |
| `write`   | `((text: string) => void) \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface ReporterOptions {
  readonly label?: string;
  readonly verbose?: boolean;
  readonly quiet?: boolean;
  readonly write?: (text: string) => void;
}
```
