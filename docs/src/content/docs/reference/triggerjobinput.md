---
title: "TriggerJobInput"
description: "TriggerJobInput — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerJobInput } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type           | Presence | Meaning                                                  |
| ------- | -------------- | -------- | -------------------------------------------------------- |
| `runId` | `string`       | Required | Checkpoint run carried by the job.                       |
| `input` | `WorkflowJson` | Required | JSON input carried by the job, null when none was given. |

## Signature

```ts
export interface TriggerJobInput {
  readonly runId: string;
  readonly input: WorkflowJson;
}
```

## Related contracts

- [WorkflowJson](../workflowjson/)
