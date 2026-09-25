---
title: "WorkflowCheckpointStore"
description: "WorkflowCheckpointStore — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowCheckpointStore**. See the [workflow checkpoints guide](../../guide/advanced/checkpoints/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowCheckpointStore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Persist lossless task results and explicitly reopen the same graph across process restarts.

Completed outputs are not replayed. Interrupted ordinary tasks require retry-incomplete authorization. Outputs must be lossless JSON; full dispatch results contain functions and cannot be checkpointed directly.

[Complete example and detailed rules](../../guide/advanced/checkpoints/).

## Parameters and properties

| Name      | Type                                                  | Presence | Meaning                                                                 |
| --------- | ----------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `acquire` | `(runId: string) => Promise<WorkflowCheckpointLease>` | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface WorkflowCheckpointStore {
  acquire(runId: string): Promise<WorkflowCheckpointLease>;
}
```

## Related contracts

- [WorkflowCheckpointLease](../workflowcheckpointlease/)
