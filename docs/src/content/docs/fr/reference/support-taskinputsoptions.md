---
title: "TaskInputsOptions"
description: "TaskInputsOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom           | Type                                                                                        | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cache`       | `TaskCacheOptions \| undefined`                                                             | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |
| `retry`       | `Retry \| undefined`                                                                        | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                                         |
| `gate`        | `WorkflowGate \| undefined`                                                                 | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                                                                                                     |
| `key`         | `string`                                                                                    | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `after`       | `readonly Task<unknown>[] \| undefined`                                                     | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                                    |
| `interaction` | `TaskInteraction \| undefined`                                                              | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                                                                                                     |
| `condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                      | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `timeoutMs`   | `number \| undefined`                                                                       | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |
| `inputs`      | `Inputs`                                                                                    | Requis    | Dépendances nommées dont les résultats typés sont transmis à perform via context.inputs. Combinées avec after sans arêtes en double.                                                                                                                                                                             |
| `perform`     | `(context: TaskContext & { readonly inputs: TaskInputValues<Inputs>; }) => T \| Promise<T>` | Requis    | Exécute la tâche avec les résultats de ses dépendances nommées et le contexte habituel.                                                                                                                                                                                                                          |

## Signature

```ts
export type TaskInputsOptions<
  T,
  Inputs extends Readonly<Record<string, Task>>,
> = Omit<TaskOptions<T>, "perform"> & {
  readonly inputs: Inputs;
  readonly perform: (
    context: TaskContext & {
      readonly inputs: TaskInputValues<Inputs>;
    },
  ) => T | Promise<T>;
};
```

## Contrats associés

- [Task](../type-task/)
- [TaskContext](../taskcontext/)
- [TaskInputValues](../support-taskinputvalues/)
- [TaskOptions](../taskoptions/)
