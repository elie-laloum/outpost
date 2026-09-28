---
title: "TaskInteractionRecord"
description: "TaskInteractionRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskInteractionRecord } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                | Présence  | Rôle                                                                                                                   |
| --------- | ----------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `state`   | `WorkflowJson \| undefined`         | Optionnel | État de continuation JSON sans perte et immuable enregistré par la tâche.                                              |
| `request` | `WorkflowInputRequest \| undefined` | Optionnel | Dernière question persistée, en attente jusqu’à l’acceptation de sa réponse.                                           |
| `answer`  | `WorkflowAnswerRecord \| undefined` | Optionnel | Réponse acceptée à request, persistée avant le nouvel ordonnancement de la tâche ; remplacée à la suspension suivante. |

## Signature

```ts
export interface TaskInteractionRecord {
  readonly state?: WorkflowJson;
  readonly request?: WorkflowInputRequest;
  readonly answer?: WorkflowAnswerRecord;
}
```

## Contrats associés

- [WorkflowAnswerRecord](../workflowanswerrecord/)
- [WorkflowInputRequest](../workflowinputrequest/)
- [WorkflowJson](../workflowjson/)
