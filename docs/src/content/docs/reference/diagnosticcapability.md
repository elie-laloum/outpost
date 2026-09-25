---
title: "DiagnosticCapability"
description: "DiagnosticCapability — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DiagnosticCapability } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                                                    | Presence | Meaning                                                                                       |
| ------------ | ----------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `id`         | `"command" \| "transfers" \| "batchTransfers" \| "interactiveTerminal"` | Required | Capability being assessed: command, transfers, batch transfers or interactive terminal.       |
| `advertised` | `boolean \| "unknown"`                                                  | Required | Whether the inspected adapter advertises this capability; unknown if it cannot be determined. |
| `observed`   | `"unverified" \| "pass" \| "fail"`                                      | Required | Probe outcome, or unverified when no probe established support.                               |

## Signature

```ts
export interface DiagnosticCapability {
  readonly id:
    "command" | "transfers" | "batchTransfers" | "interactiveTerminal";
  readonly advertised: boolean | "unknown";
  readonly observed: "pass" | "fail" | "unverified";
}
```
