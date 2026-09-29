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

| Name         | Type                                                                    | Presence | Meaning                                                                                                                                                                                        |
| ------------ | ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`         | `"command" \| "transfers" \| "batchTransfers" \| "interactiveTerminal"` | Required | Capability assessed: command, transfers, batchTransfers or interactiveTerminal.                                                                                                                |
| `advertised` | `boolean \| "unknown"`                                                  | Required | Whether the resource’s contract provides the capability: always true for command and transfers, true for batchTransfers when the lease has fileTransfers, and unknown for interactiveTerminal. |
| `observed`   | `"fail" \| "unverified" \| "pass"`                                      | Required | pass or fail from the sandbox.command or sandbox.transfers check, unverified when that probe did not run. batchTransfers and interactiveTerminal are always unverified.                        |

## Signature

```ts
export interface DiagnosticCapability {
  readonly id:
    "command" | "transfers" | "batchTransfers" | "interactiveTerminal";
  readonly advertised: boolean | "unknown";
  readonly observed: "pass" | "fail" | "unverified";
}
```
