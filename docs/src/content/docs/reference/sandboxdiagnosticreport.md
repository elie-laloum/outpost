---
title: "SandboxDiagnosticReport"
description: "SandboxDiagnosticReport — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxDiagnosticReport } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                 | Type                                                        | Presence | Meaning                                                                                                         |
| -------------------- | ----------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `scope`              | `"owned-sandbox"`                                           | Required | Always owned-sandbox: checks concern the supplied execution resource.                                           |
| `ownership`          | `"caller"`                                                  | Required | Always caller: diagnosis does not acquire ownership of resource disposal.                                       |
| `sandboxProvider`    | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optional | Provider name and placement taken from the options; absent when none was given.                                 |
| `capabilities`       | `readonly DiagnosticCapability[]`                           | Required | Advertised and observed support for commands, transfers, batch transfers and interactive terminals.             |
| `checks`             | `readonly DiagnosticCheck[]`                                | Required | Checks in the order they ran. Failure messages state the reason, often with a remedy, never the command output. |
| `modelCompatibility` | `"unverified"`                                              | Required | Always unverified: these diagnostics do not call a live model.                                                  |
| `hasFailures`        | `boolean`                                                   | Required | true when at least one check has status fail; warn and skipped checks leave it false.                           |

## Signature

```ts
export interface SandboxDiagnosticReport {
  readonly scope: "owned-sandbox";
  readonly ownership: "caller";
  readonly sandboxProvider?: Pick<SandboxProvider, "name" | "placement">;
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
