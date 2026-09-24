---
title: "diagnoseSandbox"
description: "diagnoseSandbox — Outpost API"
sidebar:
  order: 10
---

Public contract for **diagnoseSandbox**. See the [diagnostics guide](../../operations/doctor/) for behavior, defaults and examples.

## Import

```ts
import { diagnoseSandbox } from "@elie-laloum/outpost";
```

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
