---
title: "ArtifactTaskOptions"
description: "ArtifactTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ArtifactTaskOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                    | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| ------------- | ----------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retry`       | `Retry \| undefined`                                                    | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                                         |
| `key`         | `string`                                                                | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `cache`       | `TaskCacheOptions \| undefined`                                         | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |
| `gate`        | `WorkflowGate \| undefined`                                             | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                                                                                                     |
| `after`       | `readonly Task<unknown>[] \| undefined`                                 | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                                    |
| `interaction` | `TaskInteraction \| undefined`                                          | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                                                                                                     |
| `condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `timeoutMs`   | `number \| undefined`                                                   | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |
| `store`       | `ArtifactStore`                                                         | Requis    | Store qui reçoit l’artefact publié.                                                                                                                                                                                                                                                                              |
| `contract`    | `ArtifactContract<T>`                                                   | Requis    | Contrat qui valide et encode la valeur produite.                                                                                                                                                                                                                                                                 |
| `produce`     | `(context: TaskContext) => T \| Promise<T>`                             | Requis    | Calcule la valeur à publier depuis le contexte de tâche, par exemple avec context.value() d’une dépendance.                                                                                                                                                                                                      |
| `parents`     | `((context: TaskContext) => readonly ArtifactReference[]) \| undefined` | Optionnel | Renvoie les références parentes à enregistrer, en général context.value() de tâches d’artefact listées dans after. S’exécute avant produce().                                                                                                                                                                    |

## Signature

```ts
export type ArtifactTaskOptions<T> = Omit<
  TaskOptions<ArtifactReference>,
  "perform"
> & {
  readonly store: ArtifactStore;
  readonly contract: ArtifactContract<T>;
  readonly produce: (context: TaskContext) => T | Promise<T>;
  readonly parents?: (context: TaskContext) => readonly ArtifactReference[];
};
```

## Contrats associés

- [ArtifactContract](../artifactcontract/)
- [ArtifactReference](../artifactreference/)
- [ArtifactStore](../artifactstore/)
- [TaskContext](../taskcontext/)
- [TaskOptions](../taskoptions/)
