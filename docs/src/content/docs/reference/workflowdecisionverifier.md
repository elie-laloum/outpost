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

| Name       | Type               | Presence | Meaning                                                                                                                     |
| ---------- | ------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `decision` | `WorkflowDecision` | Required | Complete decision and proof to authenticate; reject invalid signatures, identity bindings, revoked keys and expired proofs. |

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
