---
title: "AgentProtocolReport"
description: "AgentProtocolReport — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AgentProtocolReport**. Consultez le [guide diagnostics](../../guide/operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { AgentProtocolReport } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter les prérequis hôtes, une sandbox possédée ou les fixtures de protocole. Les diagnostics sont des observations ; ils ne prouvent pas l’accès au compte ou au modèle.

Les contrôles distinguent capacités absentes, en échec et non prises en charge. Le diagnostic de sandbox utilise son verrou d’opération et ne devient pas propriétaire de sa fermeture.

[Exemple complet et règles détaillées](../../guide/operations/doctor/).

## Paramètres et propriétés

| Nom                  | Type                          | Présence | Rôle                                                                             |
| -------------------- | ----------------------------- | -------- | -------------------------------------------------------------------------------- |
| `scope`              | `"bundled-protocol-fixtures"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `agent`              | `DoctorAgent`                 | Requis   | Adapter natif de l’agent de code.                                                |
| `referenceVersion`   | `string`                      | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `installedCli`       | `"unverified"`                | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `modelCompatibility` | `"unverified"`                | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `checks`             | `readonly DiagnosticCheck[]`  | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `hasFailures`        | `boolean`                     | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
