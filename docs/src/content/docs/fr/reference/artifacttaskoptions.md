---
title: "ArtifactTaskOptions"
description: "ArtifactTaskOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ArtifactTaskOptions**. Consultez le [guide artefacts typés](../../guide/advanced/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ArtifactTaskOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Publier des données immuables et échanger des références avec validation du contrat, de l’empreinte et de la filiation.

Les données du store fichier sont limitées à 16 Mio par défaut. L’appelant possède la rétention. L’empreinte fournit l’intégrité par rapport à une référence fiable, pas l’authentification du producteur ni une transaction commune.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom         | Type                                                                    | Présence  | Rôle                                                                             |
| ----------- | ----------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `after`     | `readonly Task<unknown>[] \| undefined`                                 | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                        |
| `key`       | `string`                                                                | Requis    | Clé stable de tâche ou cache dans le contrat concerné.                           |
| `gate`      | `WorkflowGate \| undefined`                                             | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optionnel | Prédicat évalué avant la première tentative.                                     |
| `retry`     | `Retry \| undefined`                                                    | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                  |
| `timeoutMs` | `number \| undefined`                                                   | Optionnel | Délai en millisecondes pour l’opération concernée.                               |
| `store`     | `ArtifactStore`                                                         | Requis    | Implémentation de persistance fournie par l’appelant.                            |
| `contract`  | `ArtifactContract<T>`                                                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `produce`   | `(context: TaskContext) => T \| Promise<T>`                             | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `parents`   | `((context: TaskContext) => readonly ArtifactReference[]) \| undefined` | Optionnel | Références ou identifiants parents ordonnés.                                     |

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
