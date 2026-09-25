---
title: "DiagnosticCheck"
description: "DiagnosticCheck — Outpost API"
sidebar:
  order: 10
---

Public contract for **DiagnosticCheck**. See the [diagnostics guide](../../guide/operations/doctor/) for behavior, defaults and examples.

## Import

```ts
import type { DiagnosticCheck } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect host prerequisites, an owned sandbox or recorded agent protocol fixtures. Diagnostics report observations; they do not prove account or model access.

Checks distinguish unavailable, failed and unsupported capabilities. Sandbox diagnosis uses its existing operation gate and never takes ownership of disposal.

[Complete example and detailed rules](../../guide/operations/doctor/).

## Parameters and properties

| Name               | Type                  | Presence | Meaning                                                                 |
| ------------------ | --------------------- | -------- | ----------------------------------------------------------------------- |
| `id`               | `string`              | Required | See the linked contract and this family's rules for its interpretation. |
| `status`           | `DiagnosticStatus`    | Required | Recorded process or lifecycle outcome; inspect its declared type.       |
| `message`          | `string`              | Required | See the linked contract and this family's rules for its interpretation. |
| `version`          | `string \| undefined` | Optional | Caller-controlled contract or graph version.                            |
| `referenceVersion` | `string \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

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
