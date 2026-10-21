---
title: "WorkflowJobState"
description: "WorkflowJobState — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowJobState } from "@elie-laloum/outpost/queues";
```

## Paramètres et propriétés

| Nom              | Type                                                                                          | Présence  | Rôle                                                                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `jobStatus`      | `"failed" \| "done" \| "cancelled" \| "active" \| "pending"`                                  | Requis    | Statut de livraison dans la queue. done signifie que le handler a enregistré un résultat de workflow établi, qui peut encore être en pause ou attendre une réponse.                    |
| `runId`          | `string`                                                                                      | Requis    | Identifiant d’exécution de checkpoint porté par l’entrée du job ; il sert à répondre, décider ou inspecter l’exécution.                                                                |
| `workflowStatus` | `"failed" \| "done" \| "cancelled" \| "rejected" \| "waiting-input" \| "paused" \| undefined` | Optionnel | Statut enregistré du workflow ; absent tant que le job est pending ou active, ou si le handler a échoué avant d’enregistrer un résumé.                                                 |
| `nextAction`     | `WorkflowJobNextAction \| undefined`                                                          | Optionnel | Action attendue pour le statut enregistré du workflow : none, answer, inspect-pause ou inspect. inspect n’autorise jamais le rejeu ni la récupération du propriétaire d’un checkpoint. |

## Signature

```ts
export interface WorkflowJobState {
  /** Queue delivery state; `done` means the handler saved a settled workflow result. */
  readonly jobStatus: QueueJob["status"];
  readonly runId: string;
  /** Absent until a handler saved the workflow result. */
  readonly workflowStatus?: WorkflowResult["status"];
  readonly nextAction?: WorkflowJobNextAction;
}
```

## Contrats associés

- [QueueJob](../queuejob/)
- [WorkflowJobNextAction](../workflowjobnextaction/)
- [WorkflowResult](../workflowresult/)
