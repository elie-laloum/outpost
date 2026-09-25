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

| Name                 | Type                                                        | Presence | Meaning                                                                                             |
| -------------------- | ----------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `scope`              | `"owned-sandbox"`                                           | Required | Always owned-sandbox: checks concern the supplied execution resource.                               |
| `ownership`          | `"caller"`                                                  | Required | Always caller: diagnosis does not acquire ownership of resource disposal.                           |
| `sandboxProvider`    | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optional | Provider name and placement metadata used to interpret the diagnostic report.                       |
| `capabilities`       | `readonly DiagnosticCapability[]`                           | Required | Advertised and observed support for commands, transfers, batch transfers and interactive terminals. |
| `checks`             | `readonly DiagnosticCheck[]`                                | Required | Individual diagnostic checks with status, message and available version information.                |
| `modelCompatibility` | `"unverified"`                                              | Required | Always unverified: these diagnostics do not call a live model.                                      |
| `hasFailures`        | `boolean`                                                   | Required | Whether at least one diagnostic check failed.                                                       |

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
