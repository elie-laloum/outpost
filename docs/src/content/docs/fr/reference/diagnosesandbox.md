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

Sonde un Sandbox ou un SandboxLease qui vous appartient : Node.js, Git, flux de sortie et statut de sortie, répertoire home, ainsi que la CLI de l’agent et un transfert binaire sur demande. Une sonde en échec devient un contrôle fail dans le rapport résolu, et la ressource reste ouverte. Rejette avec le code configuration pour un deadlineMs invalide ou, sur un Sandbox, pendant qu’une autre opération s’exécute.

[Exemple complet et règles détaillées](../../guide/diagnostics/).

## Paramètres et propriétés

| Nom                       | Type                                                        | Présence  | Rôle                                                                                                                                                                                                                                                 |
| ------------------------- | ----------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `target`                  | `SandboxLease \| Sandbox`                                   | Requis    | Sandbox ou SandboxLease à sonder. Un Sandbox exécute le diagnostic comme sa propre opération exclusive ; un lease est sondé directement. Aucun des deux n’est fermé ni libéré.                                                                       |
| `options`                 | `SandboxDiagnosticOptions \| undefined`                     | Optionnel | Métadonnées d’agent et provider, sondes de transfert, annulation et délai par sonde.                                                                                                                                                                 |
| `options.agent`           | `BuiltInAgentName \| undefined`                             | Optionnel | Agent intégré dont la CLI est vérifiée dans la sandbox : sa version (agent.sandbox), puis son aide pour chaque mode utilisé par Outpost (agent.cli.&lt;mode>). Sans lui, aucun contrôle d’agent ne s’exécute.                                        |
| `options.deadlineMs`      | `number \| undefined`                                       | Optionnel | Délai de chaque commande de sonde et de chaque transfert en millisecondes, 5000 par défaut. Doit être un entier de 1 à 60000, sinon l’appel rejette avec le code configuration.                                                                      |
| `options.signal`          | `AbortSignal \| undefined`                                  | Optionnel | Annule le diagnostic. Déjà annulé, l’appel rejette avec la raison de l’annulation ; annulé pendant l’exécution, les sondes restantes sont rapportées en fail.                                                                                        |
| `options.transfers`       | `boolean \| undefined`                                      | Optionnel | true envoie un petit fichier binaire sous la racine de la sandbox, le vérifie avec un processus de la sandbox, le télécharge, puis supprime le répertoire de sonde (contrôles sandbox.transfers et sandbox.transfers.cleanup). Désactivé par défaut. |
| `options.sandboxProvider` | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optionnel | Nom et placement du provider recopiés dans le rapport. sandbox.diagnose() le remplace par le provider de la sandbox.                                                                                                                                 |

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
