---
title: "diagnoseSandbox"
description: "diagnoseSandbox — Outpost API"
sidebar:
  order: 10
---

Public contract for **diagnoseSandbox**. See the [diagnostics guide](../../guide/operations/doctor/) for behavior, defaults and examples.

## Import

```ts
import { diagnoseSandbox } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect host prerequisites, an owned sandbox or recorded agent protocol fixtures. Diagnostics report observations; they do not prove account or model access.

Checks distinguish unavailable, failed and unsupported capabilities. Sandbox diagnosis uses its existing operation gate and never takes ownership of disposal.

[Complete example and detailed rules](../../guide/operations/doctor/).

## Parameters and properties

| Name                 | Type                                                        | Presence | Meaning                                                                                  |
| -------------------- | ----------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `target`             | `SandboxLease \| Sandbox`                                   | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options`            | `SandboxDiagnosticOptions \| undefined`                     | Optional | Configuration object. Its fields are described in the associated options contract below. |
| `options.agent`      | `DoctorAgent \| undefined`                                  | Optional | Native coding-agent adapter.                                                             |
| `options.deadlineMs` | `number \| undefined`                                       | Optional | Hard operation deadline in milliseconds.                                                 |
| `options.signal`     | `AbortSignal \| undefined`                                  | Optional | Cooperative cancellation for this operation.                                             |
| `options.transfers`  | `boolean \| undefined`                                      | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.provider`   | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optional | Execution environment backend.                                                           |

## Returns

`Promise<SandboxDiagnosticReport>`

## Signature

```ts
export declare function diagnoseSandbox(
  target: Sandbox | SandboxLease,
  options?: SandboxDiagnosticOptions,
): Promise<SandboxDiagnosticReport>;
```

## Related contracts

- [Sandbox](../sandbox/)
- [SandboxDiagnosticOptions](../sandboxdiagnosticoptions/)
- [SandboxDiagnosticReport](../sandboxdiagnosticreport/)
- [SandboxLease](../sandboxlease/)
