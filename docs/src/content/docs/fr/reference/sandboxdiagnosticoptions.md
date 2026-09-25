---
title: "SandboxDiagnosticOptions"
description: "SandboxDiagnosticOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SandboxDiagnosticOptions**. Consultez le [guide diagnostics](../../guide/operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SandboxDiagnosticOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter les prérequis hôtes, une sandbox possédée ou les fixtures de protocole. Les diagnostics sont des observations ; ils ne prouvent pas l’accès au compte ou au modèle.

Les contrôles distinguent capacités absentes, en échec et non prises en charge. Le diagnostic de sandbox utilise son verrou d’opération et ne devient pas propriétaire de sa fermeture.

[Exemple complet et règles détaillées](../../guide/operations/doctor/).

## Paramètres et propriétés

| Nom          | Type                                                        | Présence  | Rôle                                                                             |
| ------------ | ----------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `agent`      | `DoctorAgent \| undefined`                                  | Optionnel | Adapter natif de l’agent de code.                                                |
| `deadlineMs` | `number \| undefined`                                       | Optionnel | Échéance absolue de l’opération en millisecondes.                                |
| `signal`     | `AbortSignal \| undefined`                                  | Optionnel | Annulation coopérative de cette opération.                                       |
| `transfers`  | `boolean \| undefined`                                      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `provider`   | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optionnel | Backend de l’environnement d’exécution.                                          |

## Signature

```ts
export interface SandboxDiagnosticOptions {
  readonly agent?: DoctorAgent;
  readonly deadlineMs?: number;
  readonly signal?: AbortSignal;
  readonly transfers?: boolean;
  readonly provider?: Pick<SandboxProvider, "name" | "placement">;
}
```

## Contrats associés

- [DoctorAgent](../doctoragent/)
- [SandboxProvider](../sandboxprovider/)
