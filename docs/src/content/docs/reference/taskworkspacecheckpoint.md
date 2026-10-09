---
title: "TaskWorkspaceCheckpoint"
description: "TaskWorkspaceCheckpoint — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskWorkspaceCheckpoint } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                                                        | Presence | Meaning                                                                                        |
| ------- | ----------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `read`  | `(key: string) => WorkflowJson \| undefined`                | Required | Read the persisted JSON resource description for a logical workspace key.                      |
| `write` | `(key: string, description: WorkflowJson) => Promise<void>` | Required | Persist a settled JSON resource description without allocating or copying files in the domain. |

## Signature

```ts
export interface TaskWorkspaceCheckpoint {
  read(key: string): WorkflowJson | undefined;
  write(key: string, description: WorkflowJson): Promise<void>;
}
```

## Related contracts

- [WorkflowJson](../workflowjson/)
