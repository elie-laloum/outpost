---
title: "WorkflowAnswer"
description: "WorkflowAnswer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowAnswer } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type     | Présence | Rôle                                                                                                   |
| ------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `executionId` | `string` | Requis   | Identifiant d’exécution recopié depuis la demande en attente.                                          |
| `key`         | `string` | Requis   | Clé de tâche recopiée depuis la demande en attente.                                                    |
| `requestId`   | `string` | Requis   | Identifiant exact de la question en attente ; les demandes périmées ou consommées sont refusées.       |
| `actor`       | `string` | Requis   | Identifiant du répondant authentifié par l’application, vérifié contre les acteurs de la tâche.        |
| `value`       | `string` | Requis   | Texte de réponse non vide ; doit correspondre à un choix proposé lorsque le texte libre est désactivé. |

## Signature

```ts
export interface WorkflowAnswer {
  readonly executionId: string;
  readonly key: string;
  readonly requestId: string;
  readonly actor: string;
  readonly value: string;
}
```
