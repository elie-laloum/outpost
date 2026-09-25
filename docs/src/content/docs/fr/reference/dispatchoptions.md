---
title: "DispatchOptions"
description: "DispatchOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **DispatchOptions**. Consultez le [guide dispatch](../../guide/agents/dispatch/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { DispatchOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécuter une tâche d’agent et collecter texte, sortie typée, commits, usage et conversation native.

Une passe est la valeur par défaut. Les échecs de processus ou réponse rejettent la promesse. Épuiser les passes peut plutôt renvoyer completed: false. Le dispatch froid ferme ses ressources ; le dispatch chaud conserve sa sandbox.

[Exemple complet et règles détaillées](../../guide/agents/dispatch/).

## Paramètres et propriétés

| Nom             | Type                                                             | Présence  | Rôle                                                                             |
| --------------- | ---------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `agent`         | `AgentAdapter \| undefined`                                      | Optionnel | Adapter natif de l’agent de code.                                                |
| `logging`       | `Logging \| undefined`                                           | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `label`         | `string \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `brief`         | `Brief`                                                          | Requis    | Entrée de tâche textuelle littérale ou provenant d’un fichier.                   |
| `passes`        | `number \| undefined`                                            | Optionnel | Nombre maximal de passes d’agent ; une par défaut.                               |
| `until`         | `string \| readonly string[] \| undefined`                       | Optionnel | Marqueur(s) de fin ; une liste vide désactive la détection.                      |
| `idleMs`        | `number \| undefined`                                            | Optionnel | Intervalle silencieux maximal en millisecondes.                                  |
| `idleWarningMs` | `number \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `settleMs`      | `number \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `deadlineMs`    | `number \| undefined`                                            | Optionnel | Échéance absolue de l’opération en millisecondes.                                |
| `expansionMs`   | `number \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `signal`        | `AbortSignal \| undefined`                                       | Optionnel | Annulation coopérative de cette opération.                                       |
| `continuation`  | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `response`      | `ResponseSpec<T> \| undefined`                                   | Optionnel | Analyseur et validateur de la réponse balisée.                                   |
| `observe`       | `((event: AgentObservation) => void) \| undefined`               | Optionnel | Callback d’observation ; ses erreurs sont isolées.                               |
| `warn`          | `((message: string) => void) \| undefined`                       | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `diagnostic`    | `((message: string) => void) \| undefined`                       | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface DispatchOptions<T = undefined> {
  readonly agent?: AgentAdapter;
  readonly logging?: Logging;
  readonly label?: string;
  readonly brief: Brief;
  readonly passes?: number;
  readonly until?: string | readonly string[];
  readonly idleMs?: number;
  readonly idleWarningMs?: number;
  readonly settleMs?: number;
  readonly deadlineMs?: number;
  readonly expansionMs?: number;
  readonly signal?: AbortSignal;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
  readonly response?: ResponseSpec<T>;
  readonly observe?: (event: AgentObservation) => void;
  readonly warn?: (message: string) => void;
  readonly diagnostic?: (message: string) => void;
}
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [AgentObservation](../agentobservation/)
- [Brief](../brief/)
- [Logging](../logging/)
- [ResponseSpec](../responsespec/)
