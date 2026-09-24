---
title: "SandboxDiagnosticReport"
description: "SandboxDiagnosticReport — Outpost API"
sidebar:
  order: 10
---

Public contract for **SandboxDiagnosticReport**. See the [diagnostics guide](../../operations/doctor/) for behavior, defaults and examples.

## Import

```ts
import type { SandboxDiagnosticReport } from "@elie-laloum/outpost";
```

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
