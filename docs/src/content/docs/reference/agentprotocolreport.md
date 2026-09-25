---
title: "AgentProtocolReport"
description: "AgentProtocolReport — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentProtocolReport } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                 | Type                          | Presence | Meaning                                                                              |
| -------------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------ |
| `scope`              | `"bundled-protocol-fixtures"` | Required | Always bundled-protocol-fixtures: checks replay recorded adapter fixtures.           |
| `agent`              | `DoctorAgent`                 | Required | Agent CLI identifier to report or diagnose: claude, codex or gemini.                 |
| `referenceVersion`   | `string`                      | Required | CLI version against which the bundled protocol fixtures were recorded.               |
| `installedCli`       | `"unverified"`                | Required | Always unverified: bundled fixture checks do not invoke the installed CLI.           |
| `modelCompatibility` | `"unverified"`                | Required | Always unverified: these diagnostics do not call a live model.                       |
| `checks`             | `readonly DiagnosticCheck[]`  | Required | Individual diagnostic checks with status, message and available version information. |
| `hasFailures`        | `boolean`                     | Required | Whether at least one diagnostic check failed.                                        |

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
