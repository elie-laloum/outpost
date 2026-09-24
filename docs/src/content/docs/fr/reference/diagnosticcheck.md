---
title: "DiagnosticCheck"
description: "DiagnosticCheck — Outpost API"
sidebar:
  order: 10
---

Contrat public de **DiagnosticCheck**. Consultez le [guide diagnostics](../../operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { DiagnosticCheck } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface DiagnosticCheck {
  readonly id: string;
  readonly status: DiagnosticStatus;
  readonly message: string;
  readonly version?: string;
  readonly referenceVersion?: string;
}
```

## Contrats associés

- [DiagnosticStatus](../diagnosticstatus/)
