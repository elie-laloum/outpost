---
title: "SandboxDiagnosticReport"
description: "SandboxDiagnosticReport — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SandboxDiagnosticReport**. Consultez le [guide diagnostics](../../operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [DiagnosticCapability](../diagnosticcapability/)
- [DiagnosticCheck](../diagnosticcheck/)
- [SandboxProvider](../sandboxprovider/)
