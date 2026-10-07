---
title: "QueuedTaskOptions"
description: "QueuedTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { QueuedTaskOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                   | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| ------------- | ---------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cache`       | `TaskCacheOptions \| undefined`                                        | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |
| `retry`       | `Retry \| undefined`                                                   | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                                         |
| `gate`        | `WorkflowGate \| undefined`                                            | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                                                                                                     |
| `key`         | `string`                                                               | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `after`       | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                                    |
| `interaction` | `TaskInteraction \| undefined`                                         | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                                                                                                     |
| `condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `timeoutMs`   | `number \| undefined`                                                  | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |
| `queue`       | `TaskQueue`                                                            | Requis    | File dans laquelle la tâche envoie son job et l’interroge.                                                                                                                                                                                                                                                       |
| `handler`     | `string`                                                               | Requis    | Nom du handler de worker qui exécute le job, de 1 à 512 caractères.                                                                                                                                                                                                                                              |
| `input`       | `(context: TaskContext) => WorkflowJson`                               | Requis    | Construit l’entrée JSON du job depuis le contexte de tâche, par exemple les valeurs des dépendances. Appelée à chaque tentative : une valeur différente sous le même identifiant de job est refusée.                                                                                                             |
| `decode`      | `(value: WorkflowJson) => T`                                           | Requis    | Convertit la valeur JSON du job en résultat de la tâche ; levez une erreur pour faire échouer la tâche.                                                                                                                                                                                                          |
| `deadline`    | `number \| undefined`                                                  | Optionnel | Deadline du job en millisecondes epoch ; le job devient cancelled une fois qu’elle est dépassée.                                                                                                                                                                                                                 |
| `pollMs`      | `number \| undefined`                                                  | Optionnel | Intervalle entre deux lectures du job en millisecondes, 250 par défaut ; doit être positif.                                                                                                                                                                                                                      |

## Signature

```ts
export type QueuedTaskOptions<T> = Omit<TaskOptions<T>, "perform"> & {
  readonly queue: TaskQueue;
  readonly handler: string;
  readonly input: (context: TaskContext) => WorkflowJson;
  readonly decode: (value: WorkflowJson) => T;
  readonly deadline?: number;
  readonly pollMs?: number;
};
```

## Contrats associés

- [TaskContext](../taskcontext/)
- [TaskOptions](../taskoptions/)
- [TaskQueue](../taskqueue/)
- [WorkflowJson](../workflowjson/)
