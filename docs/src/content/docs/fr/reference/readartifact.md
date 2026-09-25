---
title: "readArtifact"
description: "readArtifact — Outpost API"
sidebar:
  order: 10
---

Contrat public de **readArtifact**. Consultez le [guide artefacts typés](../../guide/advanced/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { readArtifact } from "@elie-laloum/outpost";
```

## Rôle et comportement

Publier des données immuables et échanger des références avec validation du contrat, de l’empreinte et de la filiation.

Les données du store fichier sont limitées à 16 Mio par défaut. L’appelant possède la rétention. L’empreinte fournit l’intégrité par rapport à une référence fiable, pas l’authentification du producteur ni une transaction commune.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom          | Type                      | Présence | Rôle                                                                             |
| ------------ | ------------------------- | -------- | -------------------------------------------------------------------------------- |
| `context`    | `TaskContext`             | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `dependency` | `Task<ArtifactReference>` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `contract`   | `ArtifactContract<T>`     | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `store`      | `ArtifactStore`           | Requis   | Implémentation de persistance fournie par l’appelant.                            |

## Retour

`Promise<T>`

## Signature

```ts
export declare function readArtifact<T>(
  context: TaskContext,
  dependency: Task<ArtifactReference>,
  contract: ArtifactContract<T>,
  store: ArtifactStore,
): Promise<T>;
```

## Contrats associés

- [ArtifactContract](../artifactcontract/)
- [ArtifactReference](../artifactreference/)
- [ArtifactStore](../artifactstore/)
- [Task](../task/)
- [TaskContext](../taskcontext/)
