---
title: "defineIsolatedCommandTask"
description: "defineIsolatedCommandTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineIsolatedCommandTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Déclare une tâche de commande avec son propre workspace de fichiers et sa sandbox, sans imposer d’agent. Les ressources empruntées restent possédées par le caller.

[Exemple complet et règles détaillées](../../guide/workspaces/).

## Paramètres et propriétés

| Nom                   | Type                                                                                          | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<CommandResult>, "perform"> & IsolatedCommandTaskOptions`                    | Requis    | Options sélectionnant la source, les capacités d’exécution ou les préconditions de récupération inspectées pour cette opération.                                                                                                                                                                                 |
| `options.cache`       | `TaskCacheOptions \| undefined`                                                               | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |
| `options.retry`       | `Retry \| undefined`                                                                          | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                                         |
| `options.gate`        | `WorkflowGate \| undefined`                                                                   | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                                                                                                     |
| `options.key`         | `string`                                                                                      | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                                       | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                                    |
| `options.interaction` | `TaskInteraction \| undefined`                                                                | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                                                                                                     |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                        | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `options.timeoutMs`   | `number \| undefined`                                                                         | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |
| `options.request`     | `(context: TaskContext) => FileIsolatedCommandRequest \| Promise<FileIsolatedCommandRequest>` | Requis    | Construit la requête de commande ou d’agent déclarée depuis le contexte de tâche courant avant acquisition.                                                                                                                                                                                                      |

## Retour

`Task<CommandResult>`

## Signature

```ts
export declare function defineIsolatedCommandTask(
  options: Omit<TaskOptions<CommandResult>, "perform"> &
    IsolatedCommandTaskOptions,
): Task<CommandResult>;
```

## Contrats associés

- [CommandResult](../commandresult/)
- [IsolatedCommandTaskOptions](../isolatedcommandtaskoptions/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
