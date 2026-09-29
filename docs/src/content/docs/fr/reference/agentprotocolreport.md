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

| Nom                  | Type                          | Présence  | Rôle                                                                                                                                            |
| -------------------- | ----------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `scope`              | `"bundled-protocol-fixtures"` | Requis    | Toujours bundled-protocol-fixtures : les contrôles rejouent les fixtures enregistrées d’adapter.                                                |
| `agent`              | `BuiltInAgentName`            | Requis    | Agent dont l’adapter a été vérifié.                                                                                                             |
| `referenceVersion`   | `string \| undefined`         | Optionnel | Version de la CLI qu’Outpost épingle pour cet agent, à comparer avec la CLI que vous avez installée.                                            |
| `installedCli`       | `"unverified"`                | Requis    | Toujours unverified : les contrôles de fixtures intégrées n’invoquent pas le CLI installé.                                                      |
| `modelCompatibility` | `"unverified"`                | Requis    | Toujours unverified : ces diagnostics n’appellent pas de modèle réel.                                                                           |
| `checks`             | `readonly DiagnosticCheck[]`  | Requis    | Un contrôle par fixture, d’identifiant protocol.fixture.&lt;name> : pass si les événements décodés sont identiques à ceux attendus, fail sinon. |
| `hasFailures`        | `boolean`                     | Requis    | true dès qu’une fixture ne se décode pas en les événements attendus.                                                                            |

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

## Contrats associés

- [DiagnosticCheck](../diagnosticcheck/)
- [DoctorAgent](../doctoragent/)
