---
title: "Workflows — Vue d’ensemble"
description: "Déclarez des tâches typées et leurs dépendances, exécutez le graphe avec relances, budgets et caches, puis lisez le résultat de chaque tâche."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Choisir une définition de tâche

Chaque définition renvoie une tâche que vous listez dans `defineWorkflow()` et reliez avec `after`. Rien ne s’exécute avant `start()`.

| Définition                            | Exécute à chaque tentative                                         | Sandbox                                           | Sortie                                           |
| ------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------ |
| `defineTask(options)`                 | Votre callback `perform`                                           | Aucune, ou celle que gère votre code              | La valeur renvoyée par `perform`                 |
| `defineCommandTask(options)`          | Une commande ; un code de sortie non nul fait échouer la tentative | La vôtre, laissée ouverte                         | `CommandResult`                                  |
| `defineAgentTask(options)`            | `sandbox.dispatch()` avec les options de `request`                 | La vôtre, laissée ouverte                         | Résultat de dispatch avec `resume()` et `fork()` |
| `defineIsolatedTask(options)`         | `dispatch()` avec les options de `request`                         | Allouée puis fermée par chaque tentative          | `DispatchResult` avec `resume()` et `fork()`     |
| `defineLoopTask(options)`             | `attempt` puis `check`, jusqu’à `maxRounds` tours                  | Aucune, ou celle que gèrent vos callbacks         | La valeur de la tentative acceptée               |
| `defineInteractiveAgentTask(options)` | Un tour d’agent, puis une question ou le JSON final                | Nouvelle à chaque tour ; le worktree est conservé | `InteractiveAgentResult`                         |

:::caution
Un checkpoint ne stocke que des sorties JSON sans perte. Dans une exécution avec checkpoint, enveloppez `defineAgentTask()` et `defineIsolatedTask()` dans une `defineTask()` qui renvoie du JSON.
:::

## Fin d’une exécution

Par défaut, `start()` exécute une tâche à la fois (`concurrency`). Il se résout dès qu’aucune tâche ne peut plus s’exécuter, même si des tâches ont échoué, et ne rejette qu’en cas d’options ou de réponses invalides, ou d’erreur de checkpoint.

| Événement                                                                                           | Statut de la tâche | Statut de l’exécution                                                                                             |
| --------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `perform` renvoie une valeur, ou son `cache` trouve une entrée (zéro tentative)                     | `done`             | `done` quand chaque tâche est `done` ou `skipped`                                                                 |
| `condition` renvoie `false`, ou une dépendance n’est pas terminée                                   | `skipped`          | Inchangé                                                                                                          |
| La dernière tentative de `retry` échoue (1 tentative par défaut)                                    | `failed`           | `failed` ; les autres tâches finissent `cancelled`, ou seules les dépendantes `skipped` avec `stopOnError: false` |
| Une limite de `budget` est atteinte                                                                 | `cancelled`        | `failed` avec `WorkflowBudgetExceeded`                                                                            |
| Erreur de quota avec `onQuota` au-delà de l’attente `maxWaitMs`, ou une gate en attente de décision | `paused`           | `paused` ; un `start()` ultérieur reprend la tâche                                                                |
| Une tâche interactive pose une question                                                             | `waiting-input`    | `waiting-input` jusqu’à `start({ answers })`                                                                      |
| `signal` annulé                                                                                     | `cancelled`        | `cancelled`                                                                                                       |
| `start({ timeoutMs })` expire                                                                       | `cancelled`        | `failed` avec une `OutpostError` de code `timeout`                                                                |

:::note
Les relances, les tours de boucle et les tentatives rejouées depuis un checkpoint répètent leurs effets de bord. Passez `context.idempotencyKey` aux services qui dédupliquent.
:::

## Points d’entrée

Guide : [Tâches et dépendances](../../../guide/task-dependencies/) · [Concurrence, relances et délais](../../../guide/concurrency-and-retries/) · [Boucles de vérification](../../../guide/verification-loops/)

- [defineTask](../../definetask/)
- [defineWorkflow](../../defineworkflow/)
- [defineAgentTask](../../defineagenttask/)
- [defineCommandTask](../../definecommandtask/)
- [defineIsolatedTask](../../defineisolatedtask/)
- [defineLoopTask](../../definelooptask/)
- [defineInteractiveAgentTask](../../defineinteractiveagenttask/)
- [repositoryFingerprint](../../repositoryfingerprint/)
- [WorkflowOptions](../../workflowoptions/)
- [WorkflowResult](../../workflowresult/)
- [TaskContext](../../taskcontext/)
- [TaskRecord](../../taskrecord/)
