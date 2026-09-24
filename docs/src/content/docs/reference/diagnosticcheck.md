---
title: "DiagnosticCheck"
description: "DiagnosticCheck — Outpost API"
sidebar:
  order: 10
---

Public contract for **DiagnosticCheck**. See the [diagnostics guide](../../operations/doctor/) for behavior, defaults and examples.

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

## Related contracts

- [DiagnosticStatus](../diagnosticstatus/)
