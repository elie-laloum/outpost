---
title: "diagnoseSandbox"
description: "diagnoseSandbox — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { diagnoseSandbox } from "@elie-laloum/outpost";
```

## Purpose and behavior

Probe a caller-owned Sandbox or SandboxLease for command execution, agent CLI and optional transfer capabilities. An owned Sandbox uses its operation gate; the function reports failures without closing the caller’s resource or making live model calls.

[Complete example and detailed rules](../../guide/operations/doctor/).

## Parameters and properties

| Name                 | Type                                                        | Presence | Meaning                                                                            |
| -------------------- | ----------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `target`             | `SandboxLease \| Sandbox`                                   | Required | Caller-owned Sandbox or SandboxLease to probe without taking disposal ownership.   |
| `options`            | `SandboxDiagnosticOptions \| undefined`                     | Optional | Agent and provider metadata, transfer probes, cancellation and per-probe deadline. |
| `options.agent`      | `DoctorAgent \| undefined`                                  | Optional | Agent CLI identifier to report or diagnose: claude, codex or gemini.               |
| `options.deadlineMs` | `number \| undefined`                                       | Optional | Maximum duration of each diagnostic probe in milliseconds.                         |
| `options.signal`     | `AbortSignal \| undefined`                                  | Optional | Cooperative cancellation for this operation.                                       |
| `options.transfers`  | `boolean \| undefined`                                      | Optional | Enable temporary upload/download probes during sandbox diagnosis.                  |
| `options.provider`   | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optional | Provider name and placement metadata used to interpret the diagnostic report.      |

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
