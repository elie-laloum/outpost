---
title: "AgentProtocolReport"
description: "AgentProtocolReport — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AgentProtocolReport**. Consultez le [guide diagnostics](../../operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [DiagnosticCheck](../diagnosticcheck/)
- [DoctorAgent](../doctoragent/)
