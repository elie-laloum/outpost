---
title: "TaskInteractionContext"
description: "TaskInteractionContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskInteractionContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                              | Présence | Rôle                                                                                                                                                                                                           |
| --------- | ----------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`   | `WorkflowJson \| undefined`                                       | Requis   | Dernier état de continuation immuable restauré depuis le checkpoint, ou undefined avant le premier enregistrement.                                                                                             |
| `answer`  | `WorkflowAnswerRecord \| undefined`                               | Requis   | Réponse humaine acceptée disponible dans la tentative reprise.                                                                                                                                                 |
| `save`    | `(state: WorkflowJson) => Promise<void>`                          | Requis   | Valide, copie et persiste l’état JSON durant la tentative active courante. Ne suspend pas l’exécution.                                                                                                         |
| `suspend` | `(question: WorkflowInputQuestion, state: WorkflowJson) => never` | Requis   | Enregistre une nouvelle question et l’état de continuation, puis termine la tentative via un signal de suspension. Ne pas intercepter ce signal ; le scheduler persiste waiting-input avant de rendre la main. |

## Signature

```ts
export interface TaskInteractionContext {
  readonly state: WorkflowJson | undefined;
  readonly answer: WorkflowAnswerRecord | undefined;
  save(state: WorkflowJson): Promise<void>;
  suspend(question: WorkflowInputQuestion, state: WorkflowJson): never;
}
```

## Contrats associés

- [WorkflowAnswerRecord](../workflowanswerrecord/)
- [WorkflowInputQuestion](../workflowinputquestion/)
- [WorkflowJson](../workflowjson/)
