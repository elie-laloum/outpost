---
title: "signWorkflowDecision"
description: "signWorkflowDecision — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { signWorkflowDecision } from "@elie-laloum/outpost";
```

## Purpose and behavior

Sign one exact workflow decision with an application-owned Ed25519 private key. Returns an immutable decision with an expiring proof; it neither submits the decision nor stores the key.

[Complete example and detailed rules](../../guide/advanced/approvals/).

## Parameters and properties

| Name                 | Type                              | Presence | Meaning                                                                                              |
| -------------------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `options`            | `WorkflowDecisionSigningOptions`  | Required | Exact decision, Ed25519 private key, key identifier and future expiration to sign.                   |
| `options.decision`   | `Omit<WorkflowDecision, "proof">` | Required | Exact execution, pending request, task, actor, action and reason to sign, without an existing proof. |
| `options.keyId`      | `string`                          | Required | Unique identifier of the corresponding trusted public key; included in the signed payload.           |
| `options.privateKey` | `KeyObject`                       | Required | Application-owned Ed25519 private KeyObject; never persisted by Outpost.                             |
| `options.expiresAt`  | `string`                          | Required | Future expiration timestamp parseable by Date.parse; the exact string is signed.                     |

## Returns

`WorkflowDecision`

## Signature

```ts
export declare function signWorkflowDecision(
  options: WorkflowDecisionSigningOptions,
): WorkflowDecision;
```

## Related contracts

- [WorkflowDecision](../workflowdecision/)
- [WorkflowDecisionSigningOptions](../workflowdecisionsigningoptions/)
