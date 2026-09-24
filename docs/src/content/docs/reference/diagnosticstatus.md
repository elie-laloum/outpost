---
title: "DiagnosticStatus"
description: "DiagnosticStatus — Outpost API"
sidebar:
  order: 10
---

Public contract for **DiagnosticStatus**. See the [diagnostics guide](../../operations/doctor/) for behavior, defaults and examples.

## Import

```ts
import type { DiagnosticStatus } from "@elie-laloum/outpost";
```

## Signature

```ts
export type DiagnosticStatus = "pass" | "warn" | "fail" | "skipped";
```
