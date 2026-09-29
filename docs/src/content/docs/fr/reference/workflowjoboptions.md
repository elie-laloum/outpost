---
title: "WorkflowJobOptions"
description: "WorkflowJobOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowJobOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                                                                  | Présence  | Rôle                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workflow`   | `(input: WorkflowJson, context: WorkflowJobContext) => Workflow \| Promise<Workflow>` | Requis    | Construit le workflow pour une entrée de job ; la même entrée doit construire le même workflow, et la fabrique peut être asynchrone.                       |
| `checkpoint` | `WorkflowJobCheckpoint`                                                               | Requis    | Stockage et version de checkpoint utilisés pour chaque job ; obligatoire.                                                                                  |
| `start`      | `WorkflowJobStartOptions \| undefined`                                                | Optionnel | Autres options de démarrage du workflow, comme concurrency, budget, onQuota ou timeoutMs ; checkpoint, signal, decisions et answers sont gérés par le job. |

## Signature

```ts
export interface WorkflowJobOptions {
  /** Builds the workflow for one job input; the same input must build the same workflow. */
  workflow(
    input: WorkflowJson,
    context: WorkflowJobContext,
  ): Workflow | Promise<Workflow>;
  readonly checkpoint: WorkflowJobCheckpoint;
  readonly start?: WorkflowJobStartOptions;
}
```

## Contrats associés

- [Workflow](../type-workflow/)
- [WorkflowJobCheckpoint](../workflowjobcheckpoint/)
- [WorkflowJobContext](../workflowjobcontext/)
- [WorkflowJobStartOptions](../workflowjobstartoptions/)
- [WorkflowJson](../workflowjson/)
