---
title: "ContinuationOptions"
description: "ContinuationOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ContinuationOptions**. Consultez le [guide dispatch](../../guide/agents/dispatch/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ContinuationOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécuter une tâche d’agent et collecter texte, sortie typée, commits, usage et conversation native.

Une passe est la valeur par défaut. Les échecs de processus ou réponse rejettent la promesse. Épuiser les passes peut plutôt renvoyer completed: false. Le dispatch froid ferme ses ressources ; le dispatch chaud conserve sa sandbox.

[Exemple complet et règles détaillées](../../guide/agents/dispatch/).

## Paramètres et propriétés

| Nom                  | Type                                                             | Présence  | Rôle                                                                               |
| -------------------- | ---------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------- |
| `agent`              | `AgentAdapter \| undefined`                                      | Optionnel | Adapter natif de l’agent de code.                                                  |
| `logging`            | `Logging \| undefined`                                           | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `label`              | `string \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `brief`              | `Brief`                                                          | Requis    | Entrée de tâche textuelle littérale ou provenant d’un fichier.                     |
| `passes`             | `number \| undefined`                                            | Optionnel | Nombre maximal de passes d’agent ; une par défaut.                                 |
| `until`              | `string \| readonly string[] \| undefined`                       | Optionnel | Marqueur(s) de fin ; une liste vide désactive la détection.                        |
| `idleMs`             | `number \| undefined`                                            | Optionnel | Intervalle silencieux maximal en millisecondes.                                    |
| `idleWarningMs`      | `number \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `settleMs`           | `number \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `deadlineMs`         | `number \| undefined`                                            | Optionnel | Échéance absolue de l’opération en millisecondes.                                  |
| `expansionMs`        | `number \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `signal`             | `AbortSignal \| undefined`                                       | Optionnel | Annulation coopérative de cette opération.                                         |
| `continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `response`           | `ResponseSpec<T> \| undefined`                                   | Optionnel | Analyseur et validateur de la réponse balisée.                                     |
| `observe`            | `((event: AgentObservation) => void) \| undefined`               | Optionnel | Callback d’observation ; ses erreurs sont isolées.                                 |
| `warn`               | `((message: string) => void) \| undefined`                       | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `diagnostic`         | `((message: string) => void) \| undefined`                       | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `branch`             | `BranchPolicy \| undefined`                                      | Optionnel | Politique de workspace Git ou identité de branche résultante selon ce contrat.     |
| `storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `repository`         | `string \| undefined`                                            | Optionnel | Checkout Git hôte ciblé.                                                           |
| `copies`             | `readonly string[] \| undefined`                                 | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                              |
| `limits`             | `StageLimits \| undefined`                                       | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `hooks`              | `LifecycleHooks \| undefined`                                    | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                    |
| `workspace`          | `Workspace \| undefined`                                         | Optionnel | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche. |
| `includeUncommitted` | `boolean \| undefined`                                           | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `provider`           | `SandboxProvider \| undefined`                                   | Optionnel | Backend de l’environnement d’exécution.                                            |
| `bootstrap`          | `boolean \| undefined`                                           | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.         |
| `conversationHome`   | `string \| undefined`                                            | Optionnel | Home hôte utilisé pour le stockage des transcripts natifs.                         |

## Signature

```ts
export type ContinuationOptions<T = undefined> = DispatchOptions<T> &
  Omit<SandboxOptions, "agent">;
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [SandboxOptions](../sandboxoptions/)
