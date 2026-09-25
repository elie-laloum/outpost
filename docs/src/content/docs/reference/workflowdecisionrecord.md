---
title: "WorkflowDecisionRecord"
description: "WorkflowDecisionRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowDecisionRecord } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                | Presence | Meaning                                                                                    |
| ------------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `decidedAt`   | `string`                            | Required | ISO timestamp assigned when the decision was validated and recorded.                       |
| `executionId` | `string`                            | Required | Identity of the workflow execution, preserved across checkpoint resumption.                |
| `key`         | `string`                            | Required | Stable task key identifying the node within its workflow graph.                            |
| `requestId`   | `string`                            | Required | ID of the exact pending gate request being answered; stale requests are rejected.          |
| `action`      | `"approve" \| "resume" \| "reject"` | Required | approve for an approval gate, resume for a pause gate, or reject to terminate either gate. |
| `actor`       | `string`                            | Required | Trusted caller-supplied actor name that must appear in the gate’s actors list.             |
| `reason`      | `string`                            | Required | Nonempty explanation supplied by the trusted actor for the decision.                       |

## Signature

```ts
export interface WorkflowDecisionRecord extends WorkflowDecision {
  readonly decidedAt: string;
}
```

## Related contracts

- [WorkflowDecision](../workflowdecision/)
