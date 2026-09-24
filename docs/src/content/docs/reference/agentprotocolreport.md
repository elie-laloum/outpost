---
title: "AgentProtocolReport"
description: "AgentProtocolReport — Outpost API"
sidebar:
  order: 10
---

Public contract for **AgentProtocolReport**. See the [diagnostics guide](../../operations/doctor/) for behavior, defaults and examples.

## Import

```ts
import type { AgentProtocolReport } from "@elie-laloum/outpost";
```

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
