---
title: "artifactTask"
description: "artifactTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { artifactTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit une tâche qui produit une valeur et la publie comme artefact. Déduit le producteur de l’exécution, de la clé de tâche et de la tentative, et enregistre les références parentes déclarées. Les dépendants reçoivent une ArtifactReference au lieu des données complètes.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom                 | Type                                                                    | Présence  | Rôle                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `ArtifactTaskOptions<T>`                                                | Requis    | Ordonnancement de tâche, contrat/store d’artefact, production de valeur et fabrique de références parentes.                  |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                 | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                    |
| `options.key`       | `string`                                                                | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                         |
| `options.gate`      | `WorkflowGate \| undefined`                                             | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante. |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optionnel | Prédicat évalué avant la première tentative.                                                                                 |
| `options.retry`     | `Retry \| undefined`                                                    | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                                                              |
| `options.timeoutMs` | `number \| undefined`                                                   | Optionnel | Durée maximale en millisecondes de chaque tentative ; l’annulation est coopérative via context.signal.                       |
| `options.store`     | `ArtifactStore`                                                         | Requis    | Store d’octets d’artefacts utilisé pour la publication immuable ou la lecture bornée des données.                            |
| `options.contract`  | `ArtifactContract<T>`                                                   | Requis    | Contrat d’artefact nommé et versionné définissant encodage et validation.                                                    |
| `options.produce`   | `(context: TaskContext) => T \| Promise<T>`                             | Requis    | Calcule la valeur typée de l’artefact depuis le contexte de tâche et les dépendances déclarées.                              |
| `options.parents`   | `((context: TaskContext) => readonly ArtifactReference[]) \| undefined` | Optionnel | Lit les références parentes d’artefacts depuis les dépendances pour enregistrer la filiation à la publication.               |

## Retour

`Task<ArtifactReference>`

## Signature

```ts
export declare function artifactTask<T>(
  options: ArtifactTaskOptions<T>,
): Task<ArtifactReference>;
```

## Contrats associés

- [ArtifactReference](../artifactreference/)
- [ArtifactTaskOptions](../artifacttaskoptions/)
- [Task](../type-task/)
