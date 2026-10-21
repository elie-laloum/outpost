---
title: "defineTask"
description: "defineTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineTask } from "@elie-laloum/outpost/workflows";
```

## Rôle et comportement

Déclare un nœud de workflow à partir de sa clé, de ses dépendances after et de son callback perform, avec en option condition, retry, timeoutMs, cache, gate ou interaction. Elle n’alloue aucune sandbox, et rien ne s’exécute avant Workflow.start(). Lève une erreur pour une clé hors de [A-Za-z0-9][A-Za-z0-9._-]*, des réglages retry ou cache invalides, ou un cache combiné à une gate ou une interaction. Les inputs nommés ajoutent les dépendances et transmettent leurs valeurs typées à perform via context.inputs. Ils se combinent avec after sans doublons ; la correspondance est copiée à la déclaration.

[Exemple complet et règles détaillées](../../guide/task-dependencies/).

## Paramètres et propriétés

### Variante 1 — `TaskInputsOptions<T, Inputs>`

| Nom                   | Type                                                                                        | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `TaskInputsOptions<T, Inputs>`                                                              | Requis    | Clé, dépendances et callback perform de la tâche, avec en option condition, retry, délai, cache, gate ou interaction.                                                                                                                                                                                            |
| `options.cache`       | `TaskCacheOptions \| undefined`                                                             | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |
| `options.retry`       | `Retry \| undefined`                                                                        | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                                         |
| `options.gate`        | `WorkflowGate \| undefined`                                                                 | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                                                                                                     |
| `options.key`         | `string`                                                                                    | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                                     | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                                    |
| `options.interaction` | `TaskInteraction \| undefined`                                                              | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                                                                                                     |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                      | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `options.timeoutMs`   | `number \| undefined`                                                                       | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |
| `options.inputs`      | `Inputs`                                                                                    | Requis    | Dépendances nommées dont les résultats typés sont transmis à perform via context.inputs. Combinées avec after sans arêtes en double.                                                                                                                                                                             |
| `options.perform`     | `(context: TaskContext & { readonly inputs: TaskInputValues<Inputs>; }) => T \| Promise<T>` | Requis    | Exécute la tâche avec les résultats de ses dépendances nommées et le contexte habituel.                                                                                                                                                                                                                          |

### Variante 2 — `TaskOptions<T>`

| Nom                   | Type                                                                   | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `TaskOptions<T>`                                                       | Requis    | Clé, dépendances et callback perform de la tâche, avec en option condition, retry, délai, cache, gate ou interaction.                                                                                                                                                                                            |
| `options.cache`       | `TaskCacheOptions \| undefined`                                        | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |
| `options.retry`       | `Retry \| undefined`                                                   | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                                         |
| `options.gate`        | `WorkflowGate \| undefined`                                            | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                                                                                                     |
| `options.key`         | `string`                                                               | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `options.interaction` | `TaskInteraction \| undefined`                                         | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                                                                                                     |
| `options.perform`     | `(context: TaskContext) => T \| Promise<T>`                            | Requis    | S’exécute à chaque tentative et renvoie la sortie de la tâche ; avec un checkpoint, cette sortie doit être du JSON sans perte ou undefined. Arrêtez le travail quand context.signal est annulé.                                                                                                                  |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `options.timeoutMs`   | `number \| undefined`                                                  | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                                    |

## Retour

`Task<T>`

## Signature

```ts
export declare function defineTask<
  T,
  Inputs extends Readonly<Record<string, Task>>,
>(options: TaskInputsOptions<T, Inputs>): Task<T>;

export declare function defineTask<T>(options: TaskOptions<T>): Task<T>;
```

## Contrats associés

- [Task](../type-task/)
- [TaskInputsOptions](../support-taskinputsoptions/)
- [TaskOptions](../taskoptions/)
