---
title: "defineAgentTask"
description: "defineAgentTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineAgentTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Déclare une tâche qui exécute sandbox.dispatch() dans une sandbox que vous avez ouverte et gardez ouverte ; request construit les options du dispatch à chaque tentative. La sortie est le résultat du dispatch avec ses méthodes resume() et fork() : une exécution avec checkpoint doit envelopper la tâche dans une defineTask() qui renvoie du JSON. L’usage s’ajoute au budget du workflow ; cache est refusé.

[Exemple complet et règles détaillées](../../guide/task-dependencies/).

## Paramètres et propriétés

| Nom                   | Type                                                                                                                                                                                                                                                                                             | Présence  | Rôle                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<FileDispatchResult<T>>, "cache" \| "perform"> & FileAgentTaskOptions<T> \| Omit<TaskOptions<DispatchResult<T>>, "cache" \| "perform"> & AgentTaskOptions<T> \| Omit<TaskOptions<DispatchResult<T> \| FileDispatchResult<T>>, "cache" \| "perform"> & MixedAgentTaskOptions<T>` | Requis    | Réglages d’ordonnancement, sandbox existante et fabrique de requêtes de dispatch.                                                                                               |
| `options.retry`       | `Retry \| undefined`                                                                                                                                                                                                                                                                             | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                        |
| `options.gate`        | `WorkflowGate \| undefined`                                                                                                                                                                                                                                                                      | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                    |
| `options.key`         | `string`                                                                                                                                                                                                                                                                                         | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                               |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                                                                                                                                                                                                                                          | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                   |
| `options.interaction` | `TaskInteraction \| undefined`                                                                                                                                                                                                                                                                   | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                    |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                                                                                                                                                                                                                           | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes. |
| `options.timeoutMs`   | `number \| undefined`                                                                                                                                                                                                                                                                            | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.        |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                                                                                                                                                                                                                                 | Optionnel | Continuation de conversation native après pause de quota, sur option explicite, sans consommer de retry de tâche.                                                               |
| `options.sandbox`     | `FileSandbox \| Sandbox`                                                                                                                                                                                                                                                                         | Requis    | Sandbox liée à ce workspace ; sa fermeture laisse ouvert un workspace emprunté.                                                                                                 |
| `options.request`     | `(context: TaskContext) => DispatchOptions<T>`                                                                                                                                                                                                                                                   | Requis    | Construit la requête de commande ou d’agent déclarée depuis le contexte de tâche courant avant acquisition.                                                                     |

## Retour

`Task<FileDispatchResult<T>>` · `Task<DispatchResult<T>>` · `Task<DispatchResult<T> | FileDispatchResult<T>>`

## Signature

```ts
export declare function defineAgentTask<T>(
  options: Omit<TaskOptions<FileDispatchResult<T>>, "perform" | "cache"> &
    FileAgentTaskOptions<T>,
): Task<FileDispatchResult<T>>;
```

## Contrats associés

- [AgentTaskOptions](../support-agenttaskoptions/)
- [DispatchResult](../dispatchresult/)
- [FileAgentTaskOptions](../fileagenttaskoptions/)
- [FileDispatchResult](../filedispatchresult/)
- [MixedAgentTaskOptions](../mixedagenttaskoptions/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
