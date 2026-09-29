---
title: "defineQueuedTask"
description: "defineQueuedTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineQueuedTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit une tâche de workflow qui envoie un job pour handler, l’interroge jusqu’à sa fin et renvoie decode(result.value), en ajoutant l’usage du job au run. L’identifiant du job dérive de executionId et de la clé de tâche : un run repris attend donc le même job ; un job failed ou cancelled fait échouer la tâche, avec le code quota quand le handler a atteint une limite d’usage. Annuler le workflow annule le job.

[Exemple complet et règles détaillées](../../guide/job-queues/).

## Paramètres et propriétés

| Nom                   | Type                                                                   | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `QueuedTaskOptions<T>`                                                 | Requis    | Définition de tâche (key, after, retry et les autres options de tâche sauf perform), plus la file, le handler, la fabrique d’entrée, le décodeur, la deadline et l’intervalle d’interrogation.                                                                                                                   |
| `options.retry`       | `Retry \| undefined`                                                   | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                                         |
| `options.key`         | `string`                                                               | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `options.cache`       | `TaskCacheOptions \| undefined`                                        | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |
| `options.gate`        | `WorkflowGate \| undefined`                                            | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                                                                                                     |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                                    |
| `options.interaction` | `TaskInteraction \| undefined`                                         | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                                                                                                     |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `options.timeoutMs`   | `number \| undefined`                                                  | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |
| `options.queue`       | `TaskQueue`                                                            | Requis    | File dans laquelle la tâche envoie son job et l’interroge.                                                                                                                                                                                                                                                       |
| `options.handler`     | `string`                                                               | Requis    | Nom du handler de worker qui exécute le job, de 1 à 512 caractères.                                                                                                                                                                                                                                              |
| `options.input`       | `(context: TaskContext) => WorkflowJson`                               | Requis    | Construit l’entrée JSON du job depuis le contexte de tâche, par exemple les valeurs des dépendances. Appelée à chaque tentative : une valeur différente sous le même identifiant de job est refusée.                                                                                                             |
| `options.decode`      | `(value: WorkflowJson) => T`                                           | Requis    | Convertit la valeur JSON du job en résultat de la tâche ; levez une erreur pour faire échouer la tâche.                                                                                                                                                                                                          |
| `options.deadline`    | `number \| undefined`                                                  | Optionnel | Deadline du job en millisecondes epoch ; le job devient cancelled une fois qu’elle est dépassée.                                                                                                                                                                                                                 |
| `options.pollMs`      | `number \| undefined`                                                  | Optionnel | Intervalle entre deux lectures du job en millisecondes, 250 par défaut ; doit être positif.                                                                                                                                                                                                                      |

## Retour

`Task<T>`

## Signature

```ts
export declare function defineQueuedTask<T>(
  options: QueuedTaskOptions<T>,
): Task<T>;
```

## Contrats associés

- [QueuedTaskOptions](../queuedtaskoptions/)
- [Task](../type-task/)
