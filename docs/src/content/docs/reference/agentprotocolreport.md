---
title: "AgentProtocolReport"
description: "AgentProtocolReport — Outpost API"
sidebar:
  order: 10
---

Public contract for **AgentProtocolReport**. See the [diagnostics guide](../../guide/operations/doctor/) for behavior, defaults and examples.

## Import

```ts
import type { AgentProtocolReport } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect host prerequisites, an owned sandbox or recorded agent protocol fixtures. Diagnostics report observations; they do not prove account or model access.

Checks distinguish unavailable, failed and unsupported capabilities. Sandbox diagnosis uses its existing operation gate and never takes ownership of disposal.

[Complete example and detailed rules](../../guide/operations/doctor/).

## Parameters and properties

| Name                 | Type                          | Presence | Meaning                                                                 |
| -------------------- | ----------------------------- | -------- | ----------------------------------------------------------------------- |
| `scope`              | `"bundled-protocol-fixtures"` | Required | See the linked contract and this family's rules for its interpretation. |
| `agent`              | `DoctorAgent`                 | Required | Native coding-agent adapter.                                            |
| `referenceVersion`   | `string`                      | Required | See the linked contract and this family's rules for its interpretation. |
| `installedCli`       | `"unverified"`                | Required | See the linked contract and this family's rules for its interpretation. |
| `modelCompatibility` | `"unverified"`                | Required | See the linked contract and this family's rules for its interpretation. |
| `checks`             | `readonly DiagnosticCheck[]`  | Required | See the linked contract and this family's rules for its interpretation. |
| `hasFailures`        | `boolean`                     | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface AgentProtocolReport {
  readonly scope: "bundled-protocol-fixtures";
  readonly agent: DoctorAgent;
  readonly referenceVersion: string;
  readonly installedCli: "unverified";
  readonly modelCompatibility: "unverified";
  readonly checks: readonly DiagnosticCheck[];
  readonly hasFailures: boolean;
}
```

## Related contracts

- [DiagnosticCheck](../diagnosticcheck/)
- [DoctorAgent](../doctoragent/)
