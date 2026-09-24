---
title: "diagnoseSandbox"
description: "diagnoseSandbox — Outpost API"
sidebar:
  order: 10
---

Contrat public de **diagnoseSandbox**. Consultez le [guide diagnostics](../../operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [Sandbox](../sandbox/)
- [SandboxDiagnosticOptions](../sandboxdiagnosticoptions/)
- [SandboxDiagnosticReport](../sandboxdiagnosticreport/)
- [SandboxLease](../sandboxlease/)
