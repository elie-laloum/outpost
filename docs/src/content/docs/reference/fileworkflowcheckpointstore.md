---
title: "fileWorkflowCheckpointStore"
description: "fileWorkflowCheckpointStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { fileWorkflowCheckpointStore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a filesystem checkpoint store under directory. Acquiring a run ID owns its checkpoint exclusively; writes replace the saved JSON atomically, and releasing the lease leaves persisted results available for a later run.

[Complete example and detailed rules](../../guide/advanced/checkpoints/).

## Parameters and properties

| Name                | Type                            | Presence | Meaning                                                              |
| ------------------- | ------------------------------- | -------- | -------------------------------------------------------------------- |
| `options`           | `FileWorkflowCheckpointOptions` | Required | Directory in which to own and persist workflow checkpoint files.     |
| `options.directory` | `string`                        | Required | Host directory used to persist checkpoint files and ownership locks. |

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
