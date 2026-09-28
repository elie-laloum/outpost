---
title: "WorkflowDecisionVerifierOptions"
description: "WorkflowDecisionVerifierOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowDecisionVerifierOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name   | Type                                                                              | Presence | Meaning                                                                                                                                |
| ------ | --------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `keys` | `() => readonly WorkflowApproverKey[] \| Promise<readonly WorkflowApproverKey[]>` | Required | Resolve trusted actor/public-key bindings on every verification. Remove a key to revoke new proofs; source errors reject the decision. |

## Signature

```ts
export interface WorkflowDecisionVerifierOptions {
  readonly keys: () =>
    readonly WorkflowApproverKey[] | Promise<readonly WorkflowApproverKey[]>;
}
```

## Related contracts

- [WorkflowApproverKey](../workflowapproverkey/)
