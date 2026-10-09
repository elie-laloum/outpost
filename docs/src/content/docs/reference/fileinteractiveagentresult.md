---
title: "FileInteractiveAgentResult"
description: "FileInteractiveAgentResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileInteractiveAgentResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                  | Presence | Meaning                                                                                          |
| --------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `output`        | `WorkflowJson`        | Required | Validated final response from the completed interactive dialogue.                                |
| `conversation`  | `string`              | Required | Captured native conversation identifier used for continuation.                                   |
| `directory`     | `string`              | Required | Absolute local materialization or source directory; it is not a portable resource identity.      |
| `turns`         | `number`              | Required | Completed dialogue turns retained without replay during ordinary answer submission.              |
| `workspaceInfo` | `FileWorkspaceRecord` | Required | Versioned workspace description retaining ownership, settled generation and recovery references. |

## Signature

```ts
export interface FileInteractiveAgentResult {
  readonly output: WorkflowJson;
  readonly conversation: string;
  readonly directory: string;
  readonly turns: number;
  readonly workspaceInfo: FileWorkspaceRecord;
}
```

## Related contracts

- [FileWorkspaceRecord](../fileworkspacerecord/)
- [WorkflowJson](../workflowjson/)
