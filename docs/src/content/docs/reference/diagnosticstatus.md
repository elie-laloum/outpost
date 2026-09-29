---
title: "DiagnosticStatus"
description: "DiagnosticStatus — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { DiagnosticStatus } from "@elie-laloum/outpost";
```

## Purpose and behavior

Result of one DiagnosticCheck in reports from outpost doctor, diagnoseSandbox() and diagnoseAgentProtocol(). Values: "pass" (check succeeded), "warn" (problem that does not block use), "fail" (blocking problem; sets hasFailures), "skipped" (not applicable to this provider or configuration, such as image checks without an image).

[Complete example and detailed rules](../../guide/diagnostics/).

## Signature

```ts
export type DiagnosticStatus = "pass" | "warn" | "fail" | "skipped";
```
