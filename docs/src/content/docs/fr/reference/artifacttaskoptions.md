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

| Nom         | Type                                                                    | Présence  | Rôle                                                                                                                         |
| ----------- | ----------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `after`     | `readonly Task<unknown>[] \| undefined`                                 | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                    |
| `key`       | `string`                                                                | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                         |
| `gate`      | `WorkflowGate \| undefined`                                             | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante. |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optionnel | Prédicat évalué avant la première tentative.                                                                                 |
| `retry`     | `Retry \| undefined`                                                    | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                                                              |
| `timeoutMs` | `number \| undefined`                                                   | Optionnel | Durée maximale en millisecondes de chaque tentative ; l’annulation est coopérative via context.signal.                       |
| `store`     | `ArtifactStore`                                                         | Requis    | Store d’octets d’artefacts utilisé pour la publication immuable ou la lecture bornée des données.                            |
| `contract`  | `ArtifactContract<T>`                                                   | Requis    | Contrat d’artefact nommé et versionné définissant encodage et validation.                                                    |
| `produce`   | `(context: TaskContext) => T \| Promise<T>`                             | Requis    | Calcule la valeur typée de l’artefact depuis le contexte de tâche et les dépendances déclarées.                              |
| `parents`   | `((context: TaskContext) => readonly ArtifactReference[]) \| undefined` | Optionnel | Lit les références parentes d’artefacts depuis les dépendances pour enregistrer la filiation à la publication.               |

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
