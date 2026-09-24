---
title: "SandboxDiagnosticOptions"
description: "SandboxDiagnosticOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SandboxDiagnosticOptions**. Consultez le [guide diagnostics](../../operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SandboxDiagnosticOptions } from "@elie-laloum/outpost";
```

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

## Contrats associés

- [DoctorAgent](../doctoragent/)
- [SandboxProvider](../sandboxprovider/)
