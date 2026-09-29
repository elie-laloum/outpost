---
title: "SandboxDiagnosticOptions"
description: "SandboxDiagnosticOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxDiagnosticOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                                                        | Présence  | Rôle                                                                                                                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent`           | `BuiltInAgentName \| undefined`                             | Optionnel | Agent intégré dont la CLI est vérifiée dans la sandbox : sa version (agent.sandbox), puis son aide pour chaque mode utilisé par Outpost (agent.cli.&lt;mode>). Sans lui, aucun contrôle d’agent ne s’exécute.                                        |
| `deadlineMs`      | `number \| undefined`                                       | Optionnel | Délai de chaque commande de sonde et de chaque transfert en millisecondes, 5000 par défaut. Doit être un entier de 1 à 60000, sinon l’appel rejette avec le code configuration.                                                                      |
| `signal`          | `AbortSignal \| undefined`                                  | Optionnel | Annule le diagnostic. Déjà annulé, l’appel rejette avec la raison de l’annulation ; annulé pendant l’exécution, les sondes restantes sont rapportées en fail.                                                                                        |
| `transfers`       | `boolean \| undefined`                                      | Optionnel | true envoie un petit fichier binaire sous la racine de la sandbox, le vérifie avec un processus de la sandbox, le télécharge, puis supprime le répertoire de sonde (contrôles sandbox.transfers et sandbox.transfers.cleanup). Désactivé par défaut. |
| `sandboxProvider` | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optionnel | Nom et placement du provider recopiés dans le rapport. sandbox.diagnose() le remplace par le provider de la sandbox.                                                                                                                                 |

## Signature

```ts
export interface SandboxDiagnosticOptions {
  readonly agent?: DoctorAgent;
  readonly deadlineMs?: number;
  readonly signal?: AbortSignal;
  readonly transfers?: boolean;
  readonly sandboxProvider?: Pick<SandboxProvider, "name" | "placement">;
}
```

## Contrats associés

- [DoctorAgent](../doctoragent/)
- [SandboxProvider](../sandboxprovider/)
