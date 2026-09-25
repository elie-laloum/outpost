---
title: "DiagnosticCapability"
description: "DiagnosticCapability — Outpost API"
sidebar:
  order: 10
---

Public contract for **DiagnosticCapability**. See the [diagnostics guide](../../guide/operations/doctor/) for behavior, defaults and examples.

## Import

```ts
import type { DiagnosticCapability } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect host prerequisites, an owned sandbox or recorded agent protocol fixtures. Diagnostics report observations; they do not prove account or model access.

Checks distinguish unavailable, failed and unsupported capabilities. Sandbox diagnosis uses its existing operation gate and never takes ownership of disposal.

[Complete example and detailed rules](../../guide/operations/doctor/).

## Parameters and properties

| Name         | Type                                                                    | Presence | Meaning                                                                 |
| ------------ | ----------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `id`         | `"command" \| "transfers" \| "batchTransfers" \| "interactiveTerminal"` | Required | See the linked contract and this family's rules for its interpretation. |
| `advertised` | `boolean \| "unknown"`                                                  | Required | See the linked contract and this family's rules for its interpretation. |
| `observed`   | `"unverified" \| "pass" \| "fail"`                                      | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface DiagnosticCapability {
  readonly id:
    "command" | "transfers" | "batchTransfers" | "interactiveTerminal";
  readonly advertised: boolean | "unknown";
  readonly observed: "pass" | "fail" | "unverified";
}
```
