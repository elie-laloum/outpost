---
title: "SandboxDiagnosticReport"
description: "SandboxDiagnosticReport — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SandboxDiagnosticReport**. Consultez le [guide diagnostics](../../guide/operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SandboxDiagnosticReport } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter les prérequis hôtes, une sandbox possédée ou les fixtures de protocole. Les diagnostics sont des observations ; ils ne prouvent pas l’accès au compte ou au modèle.

Les contrôles distinguent capacités absentes, en échec et non prises en charge. Le diagnostic de sandbox utilise son verrou d’opération et ne devient pas propriétaire de sa fermeture.

[Exemple complet et règles détaillées](../../guide/operations/doctor/).

## Paramètres et propriétés

| Nom                  | Type                                                        | Présence  | Rôle                                                                             |
| -------------------- | ----------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `scope`              | `"owned-sandbox"`                                           | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `ownership`          | `"caller"`                                                  | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `provider`           | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optionnel | Backend de l’environnement d’exécution.                                          |
| `capabilities`       | `readonly DiagnosticCapability[]`                           | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `checks`             | `readonly DiagnosticCheck[]`                                | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `modelCompatibility` | `"unverified"`                                              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `hasFailures`        | `boolean`                                                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface SandboxDiagnosticReport {
  readonly scope: "owned-sandbox";
  readonly ownership: "caller";
  readonly provider?: Pick<SandboxProvider, "name" | "placement">;
  readonly capabilities: readonly DiagnosticCapability[];
  readonly checks: readonly DiagnosticCheck[];
  readonly modelCompatibility: "unverified";
  readonly hasFailures: boolean;
}
```

## Contrats associés

- [DiagnosticCapability](../diagnosticcapability/)
- [DiagnosticCheck](../diagnosticcheck/)
- [SandboxProvider](../sandboxprovider/)
