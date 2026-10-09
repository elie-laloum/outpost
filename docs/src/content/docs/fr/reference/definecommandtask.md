---
title: "defineCommandTask"
description: "defineCommandTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineCommandTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Déclare une tâche qui exécute une commande dans une sandbox que vous avez ouverte et gardez ouverte ; command peut être une fabrique qui lit les valeurs des dépendances. Un statut de sortie non nul fait échouer la tentative avec une OutpostError de code process, et retry s’applique. La sortie est le CommandResult.

[Exemple complet et règles détaillées](../../guide/task-dependencies/).

## Paramètres et propriétés

| Nom                   | Type                                                                   | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<CommandResult>, "perform"> & CommandTaskOptions`     | Requis    | Réglages d’ordonnancement, sandbox existante et commande ou fabrique de commande.                                                                                                                                                                                                                                |
| `options.cache`       | `TaskCacheOptions \| undefined`                                        | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |
| `options.retry`       | `Retry \| undefined`                                                   | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                                         |
| `options.gate`        | `WorkflowGate \| undefined`                                            | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                                                                                                     |
| `options.key`         | `string`                                                               | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                                    |
| `options.interaction` | `TaskInteraction \| undefined`                                         | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                                                                                                     |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `options.timeoutMs`   | `number \| undefined`                                                  | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |
| `options.sandbox`     | `Pick<Sandbox, "command">`                                             | Requis    | Sandbox existante appartenant à l’appelant et réutilisée par la tâche ; la tâche ne la ferme pas.                                                                                                                                                                                                                |
| `options.command`     | `Command \| ((context: TaskContext) => Command)`                       | Requis    | Commande à exécuter, ou fabrique la construisant depuis les valeurs des dépendances.                                                                                                                                                                                                                             |

## Retour

`Task<CommandResult>`

## Signature

```ts
export declare function defineCommandTask(
  options: Omit<TaskOptions<CommandResult>, "perform"> & CommandTaskOptions,
): Task<CommandResult>;
```

## Contrats associés

- [CommandResult](../commandresult/)
- [CommandTaskOptions](../support-commandtaskoptions/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
