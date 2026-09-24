---
title: "DiagnosticStatus"
description: "DiagnosticStatus — Outpost API"
sidebar:
  order: 10
---

Contrat public de **DiagnosticStatus**. Consultez le [guide diagnostics](../../operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { DiagnosticStatus } from "@elie-laloum/outpost";
```

## Signature

```ts
export type DiagnosticStatus = "pass" | "warn" | "fail" | "skipped";
```
