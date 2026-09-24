---
title: "DiagnosticCapability"
description: "DiagnosticCapability — Outpost API"
sidebar:
  order: 10
---

Contrat public de **DiagnosticCapability**. Consultez le [guide diagnostics](../../operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { DiagnosticCapability } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface DiagnosticCapability {
  readonly id:
    "command" | "transfers" | "batchTransfers" | "interactiveTerminal";
  readonly advertised: boolean | "unknown";
  readonly observed: "pass" | "fail" | "unverified";
}
```
