---
title: "WorkflowAnswerRecord"
description: "WorkflowAnswerRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowAnswerRecord } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type     | Présence | Rôle                                                                                                   |
| ------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `answeredAt`  | `string` | Requis   | Horodatage ISO d’acceptation et d’enregistrement de cette réponse par le workflow.                     |
| `executionId` | `string` | Requis   | Identifiant d’exécution recopié depuis la demande en attente.                                          |
| `key`         | `string` | Requis   | Clé de tâche recopiée depuis la demande en attente.                                                    |
| `requestId`   | `string` | Requis   | Identifiant exact de la question en attente ; les demandes périmées ou consommées sont refusées.       |
| `actor`       | `string` | Requis   | Identifiant du répondant authentifié par l’application, vérifié contre les acteurs de la tâche.        |
| `value`       | `string` | Requis   | Texte de réponse non vide ; doit correspondre à un choix proposé lorsque le texte libre est désactivé. |

## Signature

```ts
export interface WorkflowAnswerRecord extends WorkflowAnswer {
  readonly answeredAt: string;
}
```

## Contrats associés

- [WorkflowAnswer](../workflowanswer/)
