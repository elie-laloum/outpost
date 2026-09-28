---
title: "InteractiveAgentResult"
description: "InteractiveAgentResult — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { InteractiveAgentResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type           | Presence | Meaning                                                                            |
| -------------- | -------------- | -------- | ---------------------------------------------------------------------------------- |
| `output`       | `WorkflowJson` | Required | Lossless JSON output from the completed agent dialogue.                            |
| `conversation` | `string`       | Required | Captured conversation identifier from the final turn.                              |
| `branch`       | `string`       | Required | Retained named work branch; no automatic integration or push occurs.               |
| `directory`    | `string`       | Required | Retained worktree directory containing project files, including uncommitted edits. |
| `turns`        | `number`       | Required | Number of completed dialogue turns; repair requests remain within their turn.      |

## Signature

```ts
export type InteractiveAgentResult = {
  readonly output: WorkflowJson;
  readonly conversation: string;
  readonly branch: string;
  readonly directory: string;
  readonly turns: number;
};
```

## Related contracts

- [WorkflowJson](../workflowjson/)
