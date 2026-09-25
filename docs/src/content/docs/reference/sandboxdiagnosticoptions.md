---
title: "SandboxDiagnosticOptions"
description: "SandboxDiagnosticOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **SandboxDiagnosticOptions**. See the [diagnostics guide](../../guide/operations/doctor/) for behavior, defaults and examples.

## Import

```ts
import type { SandboxDiagnosticOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect host prerequisites, an owned sandbox or recorded agent protocol fixtures. Diagnostics report observations; they do not prove account or model access.

Checks distinguish unavailable, failed and unsupported capabilities. Sandbox diagnosis uses its existing operation gate and never takes ownership of disposal.

[Complete example and detailed rules](../../guide/operations/doctor/).

## Parameters and properties

| Name         | Type                                                        | Presence | Meaning                                                                 |
| ------------ | ----------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `agent`      | `DoctorAgent \| undefined`                                  | Optional | Native coding-agent adapter.                                            |
| `deadlineMs` | `number \| undefined`                                       | Optional | Hard operation deadline in milliseconds.                                |
| `signal`     | `AbortSignal \| undefined`                                  | Optional | Cooperative cancellation for this operation.                            |
| `transfers`  | `boolean \| undefined`                                      | Optional | See the linked contract and this family's rules for its interpretation. |
| `provider`   | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optional | Execution environment backend.                                          |

## Signature

```ts
export interface SandboxDiagnosticOptions {
  readonly agent?: DoctorAgent;
  readonly deadlineMs?: number;
  readonly signal?: AbortSignal;
  readonly transfers?: boolean;
  readonly provider?: Pick<SandboxProvider, "name" | "placement">;
}
```

## Related contracts

- [DoctorAgent](../doctoragent/)
- [SandboxProvider](../sandboxprovider/)
