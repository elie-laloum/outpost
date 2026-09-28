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

| Name         | Type                              | Presence | Meaning                                                                                              |
| ------------ | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `decision`   | `Omit<WorkflowDecision, "proof">` | Required | Exact execution, pending request, task, actor, action and reason to sign, without an existing proof. |
| `keyId`      | `string`                          | Required | Unique identifier of the corresponding trusted public key; included in the signed payload.           |
| `privateKey` | `KeyObject`                       | Required | Application-owned Ed25519 private KeyObject; never persisted by Outpost.                             |
| `expiresAt`  | `string`                          | Required | Future expiration timestamp parseable by Date.parse; the exact string is signed.                     |

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
