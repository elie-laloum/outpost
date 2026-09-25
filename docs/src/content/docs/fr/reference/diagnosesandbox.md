---
title: "diagnoseSandbox"
description: "diagnoseSandbox — Outpost API"
sidebar:
  order: 10
---

Contrat public de **diagnoseSandbox**. Consultez le [guide diagnostics](../../guide/operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { diagnoseSandbox } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter les prérequis hôtes, une sandbox possédée ou les fixtures de protocole. Les diagnostics sont des observations ; ils ne prouvent pas l’accès au compte ou au modèle.

Les contrôles distinguent capacités absentes, en échec et non prises en charge. Le diagnostic de sandbox utilise son verrou d’opération et ne devient pas propriétaire de sa fermeture.

[Exemple complet et règles détaillées](../../guide/operations/doctor/).

## Paramètres et propriétés

| Nom                  | Type                                                        | Présence  | Rôle                                                                                          |
| -------------------- | ----------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `target`             | `SandboxLease \| Sandbox`                                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options`            | `SandboxDiagnosticOptions \| undefined`                     | Optionnel | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.agent`      | `DoctorAgent \| undefined`                                  | Optionnel | Adapter natif de l’agent de code.                                                             |
| `options.deadlineMs` | `number \| undefined`                                       | Optionnel | Échéance absolue de l’opération en millisecondes.                                             |
| `options.signal`     | `AbortSignal \| undefined`                                  | Optionnel | Annulation coopérative de cette opération.                                                    |
| `options.transfers`  | `boolean \| undefined`                                      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.provider`   | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optionnel | Backend de l’environnement d’exécution.                                                       |

## Retour

`Promise<SandboxDiagnosticReport>`

## Signature

```ts
export declare function diagnoseSandbox(
  target: Sandbox | SandboxLease,
  options?: SandboxDiagnosticOptions,
): Promise<SandboxDiagnosticReport>;
```

## Contrats associés

- [Sandbox](../sandbox/)
- [SandboxDiagnosticOptions](../sandboxdiagnosticoptions/)
- [SandboxDiagnosticReport](../sandboxdiagnosticreport/)
- [SandboxLease](../sandboxlease/)
