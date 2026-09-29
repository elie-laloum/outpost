---
title: "createWorkflowCheckpointStore"
description: "createWorkflowCheckpointStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createWorkflowCheckpointStore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a WorkflowCheckpointStore that keeps each run’s checkpoint and owner in one object, checkpoints/&lt;SHA-256 of runId>.json. acquire() rejects while an owner is recorded, and release keeps the saved progress. Ownership never expires: after a crash, stop the old runner and call recoverWorkflowCheckpoint().

[Complete example and detailed rules](../../guide/durable-runs/).

## Parameters and properties

| Name                  | Type                    | Presence | Meaning                                                                                                                    |
| --------------------- | ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `TransportStoreOptions` | Required | Transport that holds one object per run under checkpoints/, with its checkpoint and owner.                                 |
| `options.transporter` | `Transport`             | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Returns

`WorkflowCheckpointStore`

## Signature

```ts
export declare function createWorkflowCheckpointStore(
  options: TransportStoreOptions,
): WorkflowCheckpointStore;
```

## Related contracts

- [TransportStoreOptions](../transportstoreoptions/)
- [WorkflowCheckpointStore](../workflowcheckpointstore/)
