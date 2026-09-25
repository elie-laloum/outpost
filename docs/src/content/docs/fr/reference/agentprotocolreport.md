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

## Paramètres et propriétés

| Nom                  | Type                          | Présence | Rôle                                                                                             |
| -------------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `scope`              | `"bundled-protocol-fixtures"` | Requis   | Toujours bundled-protocol-fixtures : les contrôles rejouent les fixtures enregistrées d’adapter. |
| `agent`              | `DoctorAgent`                 | Requis   | Identifiant du CLI d’agent à rapporter ou diagnostiquer : claude, codex ou gemini.               |
| `referenceVersion`   | `string`                      | Requis   | Version du CLI ayant servi à enregistrer les fixtures de protocole intégrées.                    |
| `installedCli`       | `"unverified"`                | Requis   | Toujours unverified : les contrôles de fixtures intégrées n’invoquent pas le CLI installé.       |
| `modelCompatibility` | `"unverified"`                | Requis   | Toujours unverified : ces diagnostics n’appellent pas de modèle réel.                            |
| `checks`             | `readonly DiagnosticCheck[]`  | Requis   | Contrôles individuels avec statut, message et informations de version disponibles.               |
| `hasFailures`        | `boolean`                     | Requis   | Indique si au moins un contrôle de diagnostic a échoué.                                          |

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
