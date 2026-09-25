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

| Nom       | Type                                                  | Présence | Rôle                                                                                         |
| --------- | ----------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `acquire` | `(runId: string) => Promise<WorkflowCheckpointLease>` | Requis   | Acquiert la possession exclusive du checkpoint pour l’identifiant stable d’exécution fourni. |

## Signature

```ts
export interface WorkflowCheckpointStore {
  acquire(runId: string): Promise<WorkflowCheckpointLease>;
}
```

## Contrats associés

- [WorkflowCheckpointLease](../workflowcheckpointlease/)
