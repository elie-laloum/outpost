---
title: "defineIsolatedTask"
description: "defineIsolatedTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineIsolatedTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Déclare une tâche qui exécute dispatch() à chaque tentative avec le dépôt, le provider, l’agent et les options renvoyés par request ; chaque tentative alloue puis ferme sa propre sandbox. La sortie est le DispatchResult complet avec ses méthodes resume() et fork() : une exécution avec checkpoint doit envelopper la tâche dans une defineTask() qui renvoie du JSON. cache est refusé.

[Exemple complet et règles détaillées](../../guide/task-dependencies/).

## Paramètres et propriétés

| Nom                   | Type                                                                                  | Présence  | Rôle                                                                                                                                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<DispatchResult<T>>, "cache" \| "perform"> & IsolatedTaskOptions<T>` | Requis    | Réglages d’ordonnancement et fabrique de requêtes choisissant un dépôt et une sandbox distincts à chaque tentative.                                                                                                                                                                                   |
| `options.retry`       | `Retry \| undefined`                                                                  | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                              |
| `options.key`         | `string`                                                                              | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                     |
| `options.gate`        | `WorkflowGate \| undefined`                                                           | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                                                                                          |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                               | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                         |
| `options.interaction` | `TaskInteraction \| undefined`                                                        | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                                                                                          |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                       |
| `options.timeoutMs`   | `number \| undefined`                                                                 | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                              |
| `options.request`     | `(context: TaskContext) => IsolatedTaskRequest<T> \| Promise<IsolatedTaskRequest<T>>` | Requis    | Construit le dépôt, le provider de sandbox, l’agent et les options de dispatch de chaque tentative ; peut être asynchrone.                                                                                                                                                                            |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                      | Optionnel | Après une pause sur quota, poursuit la conversation capturée dans le nouveau dispatch (continue, par défaut) ou en démarre une nouvelle (restart). Les workspaces intégrés automatiquement partent alors de la branche interrompue ; les changements non commités restent dans son worktree conservé. |

## Retour

`Task<DispatchResult<T>>`

## Signature

```ts
export declare function defineIsolatedTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform" | "cache"> &
    IsolatedTaskOptions<T>,
): Task<DispatchResult<T>>;
```

## Contrats associés

- [DispatchResult](../dispatchresult/)
- [IsolatedTaskOptions](../support-isolatedtaskoptions/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
