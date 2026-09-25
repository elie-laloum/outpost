---
title: "artifactTask"
description: "artifactTask — Outpost API"
sidebar:
  order: 10
---

Contrat public de **artifactTask**. Consultez le [guide artefacts typés](../../guide/advanced/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { artifactTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Publier des données immuables et échanger des références avec validation du contrat, de l’empreinte et de la filiation.

Les données du store fichier sont limitées à 16 Mio par défaut. L’appelant possède la rétention. L’empreinte fournit l’intégrité par rapport à une référence fiable, pas l’authentification du producteur ni une transaction commune.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom                 | Type                                                                    | Présence  | Rôle                                                                                          |
| ------------------- | ----------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`           | `ArtifactTaskOptions<T>`                                                | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                 | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                     |
| `options.key`       | `string`                                                                | Requis    | Clé stable de tâche ou cache dans le contrat concerné.                                        |
| `options.gate`      | `WorkflowGate \| undefined`                                             | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optionnel | Prédicat évalué avant la première tentative.                                                  |
| `options.retry`     | `Retry \| undefined`                                                    | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                               |
| `options.timeoutMs` | `number \| undefined`                                                   | Optionnel | Délai en millisecondes pour l’opération concernée.                                            |
| `options.store`     | `ArtifactStore`                                                         | Requis    | Implémentation de persistance fournie par l’appelant.                                         |
| `options.contract`  | `ArtifactContract<T>`                                                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.produce`   | `(context: TaskContext) => T \| Promise<T>`                             | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.parents`   | `((context: TaskContext) => readonly ArtifactReference[]) \| undefined` | Optionnel | Références ou identifiants parents ordonnés.                                                  |

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
- [Task](../task/)
