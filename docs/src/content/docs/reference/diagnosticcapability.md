---
title: "DiagnosticCapability"
description: "DiagnosticCapability — Outpost API"
sidebar:
  order: 10
---

Public contract for **DiagnosticCapability**. See the [diagnostics guide](../../operations/doctor/) for behavior, defaults and examples.

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
