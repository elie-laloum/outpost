---
title: "WorkflowJobCheckpoint"
description: "WorkflowJobCheckpoint — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowJobCheckpoint } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                              | Presence | Meaning                                                                                                                                                       |
| --------- | --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `store`   | `WorkflowCheckpointStore`         | Required | Checkpoint store holding every run.                                                                                                                           |
| `version` | `string`                          | Required | Base version; change it when task implementations change. The effective version appends #input: and a 32-character SHA-256 digest of the job input.           |
| `resume`  | `"retry-incomplete" \| undefined` | Optional | Set to retry-incomplete to authorize replay of incomplete tasks and their side effects; without it, an incomplete checkpoint completes the job with an error. |

## Signature

```ts
export interface WorkflowJobCheckpoint {
  readonly store: WorkflowCheckpointStore;
  /** Combined with a digest of the job input to form the checkpoint version. */
  readonly version: string;
  /** Explicitly authorize replay of incomplete tasks and their side effects. */
  readonly resume?: "retry-incomplete";
}
```

## Related contracts

- [WorkflowCheckpointStore](../workflowcheckpointstore/)
