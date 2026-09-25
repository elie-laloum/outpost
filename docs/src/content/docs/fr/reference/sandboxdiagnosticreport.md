---
title: "SandboxDiagnosticReport"
description: "SandboxDiagnosticReport — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxDiagnosticReport } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                  | Type                                                        | Présence  | Rôle                                                                                                         |
| -------------------- | ----------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `scope`              | `"owned-sandbox"`                                           | Requis    | Toujours owned-sandbox : les contrôles concernent la ressource d’exécution fournie.                          |
| `ownership`          | `"caller"`                                                  | Requis    | Toujours caller : le diagnostic ne devient pas propriétaire de la fermeture de la ressource.                 |
| `sandboxProvider`    | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optionnel | Nom et placement du provider utilisés pour interpréter le rapport de diagnostic.                             |
| `capabilities`       | `readonly DiagnosticCapability[]`                           | Requis    | Prise en charge annoncée et observée des commandes, transferts, transferts par lot et terminaux interactifs. |
| `checks`             | `readonly DiagnosticCheck[]`                                | Requis    | Contrôles individuels avec statut, message et informations de version disponibles.                           |
| `modelCompatibility` | `"unverified"`                                              | Requis    | Toujours unverified : ces diagnostics n’appellent pas de modèle réel.                                        |
| `hasFailures`        | `boolean`                                                   | Requis    | Indique si au moins un contrôle de diagnostic a échoué.                                                      |

## Signature

```ts
export interface SandboxDiagnosticReport {
  readonly scope: "owned-sandbox";
  readonly ownership: "caller";
  readonly sandboxProvider?: Pick<SandboxProvider, "name" | "placement">;
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
