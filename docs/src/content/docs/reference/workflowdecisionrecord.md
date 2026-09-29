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

| Name           | Type                                        | Presence | Meaning                                                                                                                          |
| -------------- | ------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `verification` | `WorkflowDecisionVerification \| undefined` | Optional | Verified key identifier and verification time retained for audit; contains neither a private key nor a bearer token.             |
| `decidedAt`    | `string`                                    | Required | ISO timestamp assigned when the decision was validated and recorded.                                                             |
| `executionId`  | `string`                                    | Required | executionId of the run that paused the gate, from its WorkflowResult; any other value rejects the whole batch.                   |
| `key`          | `string`                                    | Required | Key of the gate task being decided.                                                                                              |
| `requestId`    | `string`                                    | Required | id of the gate's pending request (WorkflowPauseRequest.id); a stale or unknown id rejects the whole batch.                       |
| `action`       | `"approve" \| "resume" \| "reject"`         | Required | approve for an approval gate, resume for a pause gate, or reject for either. reject skips dependent tasks and fails the run.     |
| `actor`        | `string`                                    | Required | One of the gate's actors. Outpost trusts this name unless the gate is signed, in which case the proof's key must be bound to it. |
| `reason`       | `string`                                    | Required | Nonblank explanation of the decision, kept in the checkpoint.                                                                    |

## Signature

```ts
export interface WorkflowDecisionRecord extends Omit<
  WorkflowDecision,
  "proof"
> {
  readonly verification?: WorkflowDecisionVerification;
  readonly decidedAt: string;
}
```

## Related contracts

- [WorkflowDecision](../workflowdecision/)
- [WorkflowDecisionVerification](../workflowdecisionverification/)
