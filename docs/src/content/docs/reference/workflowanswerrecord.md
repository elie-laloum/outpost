---
title: "WorkflowAnswerRecord"
description: "WorkflowAnswerRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowAnswerRecord } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type     | Presence | Meaning                                                                           |
| ------------- | -------- | -------- | --------------------------------------------------------------------------------- |
| `answeredAt`  | `string` | Required | ISO timestamp when the workflow accepted and recorded this answer.                |
| `executionId` | `string` | Required | Execution identifier copied from the pending input request.                       |
| `key`         | `string` | Required | Task key copied from the pending input request.                                   |
| `requestId`   | `string` | Required | Exact pending question identifier; stale or consumed requests are rejected.       |
| `actor`       | `string` | Required | Application-authenticated respondent identifier, checked against the task actors. |
| `value`       | `string` | Required | Nonblank answer text; must equal a listed choice when free text is disabled.      |

## Signature

```ts
export interface WorkflowAnswerRecord extends WorkflowAnswer {
  readonly answeredAt: string;
}
```

## Related contracts

- [WorkflowAnswer](../workflowanswer/)
