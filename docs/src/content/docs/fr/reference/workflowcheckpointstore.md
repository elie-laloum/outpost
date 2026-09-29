---
title: "WorkflowCheckpointStore"
description: "WorkflowCheckpointStore — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowCheckpointStore } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                  | Présence | Rôle                                                                                                                                                                                                                                  |
| --------- | ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `acquire` | `(runId: string) => Promise<WorkflowCheckpointLease>` | Requis   | Prend la possession exclusive de runId et renvoie son bail. createWorkflowCheckpointStore() rejette tant qu’un propriétaire est enregistré, y compris celui d’un processus mort, jusqu’à ce que recoverWorkflowCheckpoint() l’efface. |

## Signature

```ts
export interface WorkflowCheckpointStore {
  acquire(runId: string): Promise<WorkflowCheckpointLease>;
}
```

## Contrats associés

- [WorkflowCheckpointLease](../workflowcheckpointlease/)
