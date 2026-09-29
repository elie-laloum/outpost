---
title: "recoverWorkflowCheckpoint"
description: "recoverWorkflowCheckpoint — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { recoverWorkflowCheckpoint } from "@elie-laloum/outpost";
```

## Purpose and behavior

Clear the owner of a run’s checkpoint and keep its saved progress. Rejects with TransportConflict when the object is missing or its revision differs from revision. Stop the old runner first; its interrupted tasks rerun only with resume: "retry-incomplete".

[Complete example and detailed rules](../../guide/durable-runs/).

## Parameters and properties

| Name                  | Type                        | Presence | Meaning                                                                                                                                     |
| --------------------- | --------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `CheckpointRecoveryOptions` | Required | Run and observed revision to unlock after the caller has independently stopped the previous runner.                                         |
| `options.runId`       | `string`                    | Required | Run identity whose ownership is explicitly released; saved checkpoint values remain intact.                                                 |
| `options.revision`    | `string`                    | Required | Revision of the checkpoint object read after stopping the old runner; if the object changed since, recovery rejects with TransportConflict. |
| `options.transporter` | `Transport`                 | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport.                  |

## Returns

`Promise<void>`

## Signature

```ts
export declare function recoverWorkflowCheckpoint(
  options: CheckpointRecoveryOptions,
): Promise<void>;
```

## Related contracts

- [CheckpointRecoveryOptions](../checkpointrecoveryoptions/)
