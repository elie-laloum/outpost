---
title: "WorkflowDecision"
description: "WorkflowDecision — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowDecision } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                 | Presence | Meaning                                                                                                                                                                               |
| ------------- | ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `proof`       | `WorkflowDecisionProof \| undefined` | Optional | Ed25519 proof from signWorkflowDecision() over this exact decision. A signed gate requires it; a proof sent to an unsigned gate is verified too, so it also needs a decisionVerifier. |
| `executionId` | `string`                             | Required | executionId of the run that paused the gate, from its WorkflowResult; any other value rejects the whole batch.                                                                        |
| `key`         | `string`                             | Required | Key of the gate task being decided.                                                                                                                                                   |
| `requestId`   | `string`                             | Required | id of the gate's pending request (WorkflowPauseRequest.id); a stale or unknown id rejects the whole batch.                                                                            |
| `action`      | `"approve" \| "resume" \| "reject"`  | Required | approve for an approval gate, resume for a pause gate, or reject for either. reject skips dependent tasks and fails the run.                                                          |
| `actor`       | `string`                             | Required | One of the gate's actors. Outpost trusts this name unless the gate is signed, in which case the proof's key must be bound to it.                                                      |
| `reason`      | `string`                             | Required | Nonblank explanation of the decision, kept in the checkpoint.                                                                                                                         |

## Signature

```ts
export interface WorkflowDecision {
  readonly proof?: WorkflowDecisionProof;
  readonly executionId: string;
  readonly key: string;
  readonly requestId: string;
  readonly action: "approve" | "resume" | "reject";
  readonly actor: string;
  readonly reason: string;
}
```

## Related contracts

- [WorkflowDecisionProof](../workflowdecisionproof/)
