---
title: "DiagnosticCheck"
description: "DiagnosticCheck — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DiagnosticCheck } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                  | Presence | Meaning                                                                |
| ------------------ | --------------------- | -------- | ---------------------------------------------------------------------- |
| `id`               | `string`              | Required | Stable identifier of the diagnostic check in the report.               |
| `status`           | `DiagnosticStatus`    | Required | Diagnostic outcome: pass, warn, fail or skipped.                       |
| `message`          | `string`              | Required | Human-readable explanation of the diagnostic observation.              |
| `version`          | `string \| undefined` | Optional | Version detected by the diagnostic probe, when available.              |
| `referenceVersion` | `string \| undefined` | Optional | CLI version against which the bundled protocol fixtures were recorded. |

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
