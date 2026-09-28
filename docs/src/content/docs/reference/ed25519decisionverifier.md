---
title: "ed25519DecisionVerifier"
description: "ed25519DecisionVerifier — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { ed25519DecisionVerifier } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a verifier that resolves trusted approver keys on every decision, checks the Ed25519 signature, actor binding and expiry, and returns audit metadata. Missing, duplicate or revoked key identifiers are rejected.

[Complete example and detailed rules](../../guide/advanced/approvals/).

## Parameters and properties

| Name           | Type                                                                              | Presence | Meaning                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `options`      | `WorkflowDecisionVerifierOptions`                                                 | Required | Live trusted public-key source owned by the application.                                                                               |
| `options.keys` | `() => readonly WorkflowApproverKey[] \| Promise<readonly WorkflowApproverKey[]>` | Required | Resolve trusted actor/public-key bindings on every verification. Remove a key to revoke new proofs; source errors reject the decision. |

## Returns

`WorkflowDecisionVerifier`

## Signature

```ts
export declare function ed25519DecisionVerifier(
  options: WorkflowDecisionVerifierOptions,
): WorkflowDecisionVerifier;
```

## Related contracts

- [WorkflowDecisionVerifier](../workflowdecisionverifier/)
- [WorkflowDecisionVerifierOptions](../workflowdecisionverifieroptions/)
