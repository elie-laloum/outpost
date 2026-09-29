---
title: "WorkflowDecisionVerifier"
description: "WorkflowDecisionVerifier — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowDecisionVerifier } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type               | Presence | Meaning                                                                                                                                                            |
| ---------- | ------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `decision` | `WorkflowDecision` | Required | Decision to authenticate, including its proof. Throw when the signature, key, actor binding or expiry is invalid; start() then applies no decision from the batch. |

## Returns

`WorkflowDecisionVerification | Promise<WorkflowDecisionVerification>`

## Signature

```ts
export type WorkflowDecisionVerifier = (
  decision: WorkflowDecision,
) => Promise<WorkflowDecisionVerification> | WorkflowDecisionVerification;
```

## Related contracts

- [WorkflowDecision](../workflowdecision/)
- [WorkflowDecisionVerification](../workflowdecisionverification/)
