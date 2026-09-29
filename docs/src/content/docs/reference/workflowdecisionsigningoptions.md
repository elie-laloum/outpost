---
title: "WorkflowDecisionSigningOptions"
description: "WorkflowDecisionSigningOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowDecisionSigningOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                              | Presence | Meaning                                                                                                                                 |
| ------------ | --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `decision`   | `Omit<WorkflowDecision, "proof">` | Required | Exact execution, pending request, task, actor, action and reason to sign, without an existing proof.                                    |
| `keyId`      | `string`                          | Required | Identifier of the matching trusted public key, nonblank and at most 512 characters; signed with the decision and copied into the proof. |
| `privateKey` | `KeyObject`                       | Required | Ed25519 private KeyObject owned by your application; any other key type throws. Outpost never stores it.                                |
| `expiresAt`  | `string`                          | Required | Proof expiry, parseable by Date.parse and later than now; the exact string is signed.                                                   |

## Signature

```ts
import type { KeyObject } from "node:crypto";

export interface WorkflowDecisionSigningOptions {
  readonly decision: Omit<WorkflowDecision, "proof">;
  readonly keyId: string;
  readonly privateKey: KeyObject;
  readonly expiresAt: string;
}
```

## Related contracts

- [WorkflowDecision](../workflowdecision/)
