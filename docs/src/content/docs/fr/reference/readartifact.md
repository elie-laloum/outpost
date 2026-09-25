---
title: "readArtifact"
description: "readArtifact — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { readArtifact } from "@elie-laloum/outpost";
```

## Rôle et comportement

Lit une référence d’artefact depuis une dépendance déclarée via context.value, puis charge et valide ses données stockées. Applique le signal d’annulation de la tâche et vérifie le producteur par rapport à l’exécution courante et à la clé de dépendance.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom          | Type                      | Présence | Rôle                                                                                              |
| ------------ | ------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `context`    | `TaskContext`             | Requis   | Contexte courant de tâche utilisé pour lire les dépendances et propager l’annulation.             |
| `dependency` | `Task<ArtifactReference>` | Requis   | Dépendance déclarée dont la sortie terminée est la référence d’artefact à lire.                   |
| `contract`   | `ArtifactContract<T>`     | Requis   | Contrat d’artefact nommé et versionné définissant encodage et validation.                         |
| `store`      | `ArtifactStore`           | Requis   | Store d’octets d’artefacts utilisé pour la publication immuable ou la lecture bornée des données. |

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
- [Task](../type-task/)
- [TaskContext](../taskcontext/)
