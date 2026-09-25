---
title: "ArtifactProducer"
description: "ArtifactProducer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ArtifactProducer } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type     | Présence | Rôle                                                                               |
| ------------- | -------- | -------- | ---------------------------------------------------------------------------------- |
| `executionId` | `string` | Requis   | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint. |
| `taskKey`     | `string` | Requis   | Clé de la tâche de workflow ayant publié l’artefact.                               |
| `attempt`     | `number` | Requis   | Numéro de tentative de tâche commençant à un.                                      |

## Signature

```ts
export interface ArtifactProducer {
  readonly executionId: string;
  readonly taskKey: string;
  readonly attempt: number;
}
```
