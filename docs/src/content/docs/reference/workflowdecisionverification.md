---
title: "WorkflowDecisionVerification"
description: "WorkflowDecisionVerification — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowDecisionVerification } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type     | Presence | Meaning                                                          |
| ------------ | -------- | -------- | ---------------------------------------------------------------- |
| `keyId`      | `string` | Required | Identifier of the trusted key that verified this decision.       |
| `verifiedAt` | `string` | Required | Timestamp at which the decision proof was successfully verified. |

## Signature

```ts
export interface WorkflowDecisionVerification {
  readonly keyId: string;
  readonly verifiedAt: string;
}
```
