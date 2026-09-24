---
title: "SandboxDiagnosticOptions"
description: "SandboxDiagnosticOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **SandboxDiagnosticOptions**. See the [diagnostics guide](../../operations/doctor/) for behavior, defaults and examples.

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

## Related contracts

- [DoctorAgent](../doctoragent/)
- [SandboxProvider](../sandboxprovider/)
