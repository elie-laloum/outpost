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

| Name                 | Type                          | Presence | Meaning                                                                                                                          |
| -------------------- | ----------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `scope`              | `"bundled-protocol-fixtures"` | Required | Always bundled-protocol-fixtures: checks replay recorded adapter fixtures.                                                       |
| `agent`              | `BuiltInAgentName`            | Required | Agent whose adapter was checked.                                                                                                 |
| `referenceVersion`   | `string \| undefined`         | Optional | CLI version Outpost pins for this agent, to compare with the CLI you installed.                                                  |
| `installedCli`       | `"unverified"`                | Required | Always unverified: bundled fixture checks do not invoke the installed CLI.                                                       |
| `modelCompatibility` | `"unverified"`                | Required | Always unverified: these diagnostics do not call a live model.                                                                   |
| `checks`             | `readonly DiagnosticCheck[]`  | Required | One check per fixture, with id protocol.fixture.&lt;name>: pass when the decoded events equal the expected ones, fail otherwise. |
| `hasFailures`        | `boolean`                     | Required | true when at least one fixture did not decode to the expected events.                                                            |

## Signature

```ts
export interface AgentProtocolReport {
  readonly scope: "bundled-protocol-fixtures";
  readonly agent: DoctorAgent;
  readonly referenceVersion?: string;
  readonly installedCli: "unverified";
  readonly modelCompatibility: "unverified";
  readonly checks: readonly DiagnosticCheck[];
  readonly hasFailures: boolean;
}
```

## Related contracts

- [DiagnosticCheck](../diagnosticcheck/)
- [DoctorAgent](../doctoragent/)
