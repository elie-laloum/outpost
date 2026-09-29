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

Lit l’artefact publié par une dépendance déclarée : prend sa référence dans context.value(), rejette avec Artifact dependency producer mismatch si une autre exécution ou une autre tâche l’a produite, puis la vérifie et la décode comme readStoredArtifact() sous le signal de la tâche.

[Exemple complet et règles détaillées](../../guide/artifacts/).

## Paramètres et propriétés

| Nom          | Type                      | Présence | Rôle                                                                                                                                   |
| ------------ | ------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `context`    | `TaskContext`             | Requis   | Contexte de la tâche en cours ; fournit la sortie de la dépendance, l’id d’exécution et le signal d’annulation.                        |
| `dependency` | `Task<ArtifactReference>` | Requis   | Tâche d’artefact listée dans le after de cette tâche ; sa sortie est la référence à lire. Une dépendance non déclarée lève une erreur. |
| `contract`   | `ArtifactContract<T>`     | Requis   | Contrat attendu ; doit correspondre au nom, à la version et à l’encodage de la référence.                                              |
| `store`      | `ArtifactStore`           | Requis   | Store qui contient les octets de l’artefact.                                                                                           |

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
