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

Sign one exact decision with an application-owned Ed25519 private key and return a frozen copy carrying its proof. It neither submits the decision nor stores the key. Throws on a non-Ed25519 key, a blank decision field or key identifier, or an expiresAt that is not in the future.

[Complete example and detailed rules](../../guide/approvals/).

## Parameters and properties

| Name                 | Type                              | Presence | Meaning                                                                                                                                 |
| -------------------- | --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `WorkflowDecisionSigningOptions`  | Required | Exact decision, Ed25519 private key, key identifier and future expiration to sign.                                                      |
| `options.decision`   | `Omit<WorkflowDecision, "proof">` | Required | Exact execution, pending request, task, actor, action and reason to sign, without an existing proof.                                    |
| `options.keyId`      | `string`                          | Required | Identifier of the matching trusted public key, nonblank and at most 512 characters; signed with the decision and copied into the proof. |
| `options.privateKey` | `KeyObject`                       | Required | Ed25519 private KeyObject owned by your application; any other key type throws. Outpost never stores it.                                |
| `options.expiresAt`  | `string`                          | Required | Proof expiry, parseable by Date.parse and later than now; the exact string is signed.                                                   |

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
