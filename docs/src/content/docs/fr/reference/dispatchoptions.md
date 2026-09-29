---
title: "DispatchOptions"
description: "DispatchOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DispatchOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                             | Présence  | Rôle                                                                                                                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observation`   | `ObservationHub \| undefined`                                    | Optionnel | Hub parent facultatif ; le dispatch crée un enfant avec son dispatchId et le vide avant retour ou exception.                                                                                                                                                          |
| `agent`         | `DispatchAgent \| undefined`                                     | Optionnel | Agent qui exécute le dispatch : un agent unique composé avec agent() ou replayAgent(), ou un fallbackAgent() dont les candidats sont essayés dans l’ordre sur les échecs de quota ou de panne listés. Un agent de secours ne peut pas être combiné avec continuation. |
| `logging`       | `Logging \| undefined`                                           | Optionnel | Configure le transport du journal du dispatch, la conservation des événements détaillés et l’enregistrement rejouable des commits.                                                                                                                                    |
| `label`         | `string \| undefined`                                            | Optionnel | Libellé lisible utilisé dans les rapports d’exécution.                                                                                                                                                                                                                |
| `brief`         | `Brief`                                                          | Requis    | Entrée de tâche textuelle littérale ou provenant d’un fichier.                                                                                                                                                                                                        |
| `passes`        | `number \| undefined`                                            | Optionnel | Nombre maximal de passes d’agent ; une par défaut.                                                                                                                                                                                                                    |
| `until`         | `string \| readonly string[] \| undefined`                       | Optionnel | Marqueur(s) de fin ; une liste vide désactive la détection.                                                                                                                                                                                                           |
| `idleMs`        | `number \| undefined`                                            | Optionnel | Intervalle silencieux maximal en millisecondes.                                                                                                                                                                                                                       |
| `idleWarningMs` | `number \| undefined`                                            | Optionnel | Intervalle de silence en millisecondes avant émission d’un avertissement d’inactivité.                                                                                                                                                                                |
| `settleMs`      | `number \| undefined`                                            | Optionnel | Délai de grâce en millisecondes après détection de fin avant l’arrêt d’un processus d’agent encore actif.                                                                                                                                                             |
| `deadlineMs`    | `number \| undefined`                                            | Optionnel | Durée maximale de chaque processus d’agent en millisecondes ; une heure par défaut.                                                                                                                                                                                   |
| `expansionMs`   | `number \| undefined`                                            | Optionnel | Délai en millisecondes de chaque expansion shell d’origine d’un brief fichier ; 30000 par défaut.                                                                                                                                                                     |
| `signal`        | `AbortSignal \| undefined`                                       | Optionnel | Annulation coopérative de cette opération.                                                                                                                                                                                                                            |
| `continuation`  | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optionnel | Identifiant de conversation native à poursuivre ; fork demande une conversation distincte dérivée de celle-ci.                                                                                                                                                        |
| `response`      | `ResponseSpec<T> \| undefined`                                   | Optionnel | Analyseur et validateur de la réponse balisée.                                                                                                                                                                                                                        |
| `telemetry`     | `DispatchTelemetry \| undefined`                                 | Optionnel | Instrumentation optionnelle du dispatch complet, préparation, synchronisation et nettoyage compris ; ses erreurs ne changent pas le résultat.                                                                                                                         |
| `observe`       | `((event: AgentObservation) => void) \| undefined`               | Optionnel | Reçoit les observations normalisées d’agent avec numéro de passe et horodatage ; les erreurs d’observation sont isolées.                                                                                                                                              |
| `warn`          | `((message: string) => void) \| undefined`                       | Optionnel | Callback recevant les avertissements non bloquants d’exécution ou de stockage des conversations.                                                                                                                                                                      |
| `diagnostic`    | `((message: string) => void) \| undefined`                       | Optionnel | Callback recevant les messages de diagnostic d’exécution.                                                                                                                                                                                                             |

## Signature

```ts
export interface DispatchOptions<T = undefined> {
  readonly observation?: ObservationHub;
  readonly agent?: DispatchAgent;
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
  readonly telemetry?: DispatchTelemetry;
  readonly observe?: (event: AgentObservation) => void;
  readonly warn?: (message: string) => void;
  readonly diagnostic?: (message: string) => void;
}
```

## Contrats associés

- [AgentObservation](../agentobservation/)
- [Brief](../brief/)
- [DispatchAgent](../dispatchagent/)
- [DispatchTelemetry](../dispatchtelemetry/)
- [Logging](../logging/)
- [ObservationHub](../observationhub/)
- [ResponseSpec](../responsespec/)
