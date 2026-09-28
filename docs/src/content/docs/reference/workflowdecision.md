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

| Name          | Type                                 | Presence | Meaning                                                                                                               |
| ------------- | ------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `proof`       | `WorkflowDecisionProof \| undefined` | Optional | Optional Ed25519 proof over this exact decision; required by signed gates and checked before any decision is applied. |
| `executionId` | `string`                             | Required | Identity of the workflow execution, preserved across checkpoint resumption.                                           |
| `key`         | `string`                             | Required | Stable task key identifying the node within its workflow graph.                                                       |
| `requestId`   | `string`                             | Required | ID of the exact pending gate request being answered; stale requests are rejected.                                     |
| `action`      | `"approve" \| "resume" \| "reject"`  | Required | approve for an approval gate, resume for a pause gate, or reject to terminate either gate.                            |
| `actor`       | `string`                             | Required | Actor name that must be allowed by the gate; signed gates also verify the public key bound to this actor.             |
| `reason`      | `string`                             | Required | Nonempty explanation supplied by the trusted actor for the decision.                                                  |

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
