---
title: "TaskCacheOptions"
description: "TaskCacheOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskCacheOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                                              | Présence  | Rôle                                                                                                                                                                                                                                                 |
| ---------- | ----------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `store`    | `TaskCacheStore`                                                  | Requis    | Store appartenant à l’appelant qui lit et écrit les entrées de cache, par exemple taskCacheStore sur un Transport.                                                                                                                                   |
| `version`  | `string`                                                          | Requis    | Version non vide incluse dans l’empreinte ; changez-la lorsque l’implémentation de la tâche, l’agent, le prompt ou le contrat de sortie change.                                                                                                      |
| `key`      | `(context: TaskContext) => WorkflowJson \| Promise<WorkflowJson>` | Requis    | Renvoie les entrées JSON sans perte qui déterminent le résultat, par exemple l’empreinte du dépôt, le brief et le modèle. S’exécute avant chaque exécution avec attempt 0 et peut lire les dépendances déclarées ; une erreur fait échouer la tâche. |
| `maxAgeMs` | `number \| undefined`                                             | Optionnel | Âge maximal positif en millisecondes ; une entrée plus ancienne est un miss et est remplacée après la réussite de la tâche.                                                                                                                          |
| `mode`     | `TaskCacheMode \| undefined`                                      | Optionnel | reuse (par défaut) lit d’abord le store ; refresh ignore les entrées existantes, exécute la tâche et remplace l’entrée.                                                                                                                              |

## Signature

```ts
export interface TaskCacheOptions {
  readonly store: TaskCacheStore;
  /** Change when the task implementation, agent or output contract changes. */
  readonly version: string;
  readonly key: (context: TaskContext) => WorkflowJson | Promise<WorkflowJson>;
  readonly maxAgeMs?: number;
  readonly mode?: TaskCacheMode;
}
```

## Contrats associés

- [TaskCacheMode](../taskcachemode/)
- [TaskCacheStore](../type-taskcachestore/)
- [TaskContext](../taskcontext/)
- [WorkflowJson](../workflowjson/)
