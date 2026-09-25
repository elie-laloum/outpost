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

Explicitly clear checkpoint ownership without deleting its saved progress. The caller must first ensure the old runner has stopped. The expected revision fences concurrent changes; incomplete-task replay still requires resume: retry-incomplete.

[Complete example and detailed rules](../../guide/operations/storage-transports/).

## Parameters and properties

| Name                  | Type                        | Presence | Meaning                                                                                                                    |
| --------------------- | --------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `CheckpointRecoveryOptions` | Required | Run and observed revision to unlock after the caller has independently stopped the previous runner.                        |
| `options.runId`       | `string`                    | Required | Run identity whose ownership is explicitly released; saved checkpoint values remain intact.                                |
| `options.revision`    | `string`                    | Required | Revision observed after stopping the old runner; a changed revision refuses recovery.                                      |
| `options.transporter` | `Transport`                 | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

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
