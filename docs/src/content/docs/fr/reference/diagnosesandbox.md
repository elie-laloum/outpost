---
title: "diagnoseSandbox"
description: "diagnoseSandbox — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { diagnoseSandbox } from "@elie-laloum/outpost";
```

## Rôle et comportement

Sonde un Sandbox ou SandboxLease appartenant à l’appelant pour vérifier commandes, CLI d’agent et transferts optionnels. Un Sandbox utilise son verrou d’opération ; la fonction rapporte les échecs sans fermer la ressource ni appeler de modèle réel.

[Exemple complet et règles détaillées](../../guide/operations/doctor/).

## Paramètres et propriétés

| Nom                  | Type                                                        | Présence  | Rôle                                                                                                 |
| -------------------- | ----------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `target`             | `SandboxLease \| Sandbox`                                   | Requis    | Sandbox ou SandboxLease appartenant à l’appelant à sonder sans devenir propriétaire de sa fermeture. |
| `options`            | `SandboxDiagnosticOptions \| undefined`                     | Optionnel | Métadonnées d’agent et provider, sondes de transfert, annulation et délai par sonde.                 |
| `options.agent`      | `DoctorAgent \| undefined`                                  | Optionnel | Identifiant du CLI d’agent à rapporter ou diagnostiquer : claude, codex ou gemini.                   |
| `options.deadlineMs` | `number \| undefined`                                       | Optionnel | Durée maximale de chaque sonde de diagnostic en millisecondes.                                       |
| `options.signal`     | `AbortSignal \| undefined`                                  | Optionnel | Annulation coopérative de cette opération.                                                           |
| `options.transfers`  | `boolean \| undefined`                                      | Optionnel | Active des sondes temporaires d’envoi et téléchargement pendant le diagnostic de sandbox.            |
| `options.provider`   | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optionnel | Nom et placement du provider utilisés pour interpréter le rapport de diagnostic.                     |

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
