---
title: "SandboxDiagnosticReport"
description: "SandboxDiagnosticReport — Outpost API"
sidebar:
  order: 10
---

Public contract for **SandboxDiagnosticReport**. See the [diagnostics guide](../../guide/operations/doctor/) for behavior, defaults and examples.

## Import

```ts
import type { SandboxDiagnosticReport } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect host prerequisites, an owned sandbox or recorded agent protocol fixtures. Diagnostics report observations; they do not prove account or model access.

Checks distinguish unavailable, failed and unsupported capabilities. Sandbox diagnosis uses its existing operation gate and never takes ownership of disposal.

[Complete example and detailed rules](../../guide/operations/doctor/).

## Parameters and properties

| Name                 | Type                                                        | Presence | Meaning                                                                 |
| -------------------- | ----------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `scope`              | `"owned-sandbox"`                                           | Required | See the linked contract and this family's rules for its interpretation. |
| `ownership`          | `"caller"`                                                  | Required | See the linked contract and this family's rules for its interpretation. |
| `provider`           | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optional | Execution environment backend.                                          |
| `capabilities`       | `readonly DiagnosticCapability[]`                           | Required | See the linked contract and this family's rules for its interpretation. |
| `checks`             | `readonly DiagnosticCheck[]`                                | Required | See the linked contract and this family's rules for its interpretation. |
| `modelCompatibility` | `"unverified"`                                              | Required | See the linked contract and this family's rules for its interpretation. |
| `hasFailures`        | `boolean`                                                   | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface SandboxDiagnosticReport {
  readonly scope: "owned-sandbox";
  readonly ownership: "caller";
  readonly provider?: Pick<SandboxProvider, "name" | "placement">;
  readonly capabilities: readonly DiagnosticCapability[];
  readonly checks: readonly DiagnosticCheck[];
  readonly modelCompatibility: "unverified";
  readonly hasFailures: boolean;
}
```

## Related contracts

- [DiagnosticCapability](../diagnosticcapability/)
- [DiagnosticCheck](../diagnosticcheck/)
- [SandboxProvider](../sandboxprovider/)
