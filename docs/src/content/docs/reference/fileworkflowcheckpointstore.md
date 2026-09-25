---
title: "fileWorkflowCheckpointStore"
description: "fileWorkflowCheckpointStore — Outpost API"
sidebar:
  order: 10
---

Public contract for **fileWorkflowCheckpointStore**. See the [workflow checkpoints guide](../../guide/advanced/checkpoints/) for behavior, defaults and examples.

## Import

```ts
import { fileWorkflowCheckpointStore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Persist lossless task results and explicitly reopen the same graph across process restarts.

Completed outputs are not replayed. Interrupted ordinary tasks require retry-incomplete authorization. Outputs must be lossless JSON; full dispatch results contain functions and cannot be checkpointed directly.

[Complete example and detailed rules](../../guide/advanced/checkpoints/).

## Parameters and properties

| Name                | Type                            | Presence | Meaning                                                                                  |
| ------------------- | ------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`           | `FileWorkflowCheckpointOptions` | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.directory` | `string`                        | Required | Filesystem directory used by the owning operation; see path rules.                       |

## Returns

`WorkflowCheckpointStore`

## Signature

```ts
export declare function fileWorkflowCheckpointStore(
  options: FileWorkflowCheckpointOptions,
): WorkflowCheckpointStore;
```

## Related contracts

- [FileWorkflowCheckpointOptions](../fileworkflowcheckpointoptions/)
- [WorkflowCheckpointStore](../workflowcheckpointstore/)
