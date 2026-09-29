---
title: "createEd25519DecisionVerifier"
description: "createEd25519DecisionVerifier — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createEd25519DecisionVerifier } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a WorkflowDecisionVerifier that loads the trusted keys on every call, then checks the proof's key, its actor binding, the Ed25519 signature and the expiry. Returns keyId and verifiedAt; throws on an unknown, duplicated or wrongly bound key, an invalid signature or an expired proof.

[Complete example and detailed rules](../../guide/approvals/).

## Parameters and properties

| Name           | Type                                                                              | Presence | Meaning                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `options`      | `WorkflowDecisionVerifierOptions`                                                 | Required | Live trusted public-key source owned by the application.                                                                               |
| `options.keys` | `() => readonly WorkflowApproverKey[] \| Promise<readonly WorkflowApproverKey[]>` | Required | Resolve trusted actor/public-key bindings on every verification. Remove a key to revoke new proofs; source errors reject the decision. |

## Returns

`WorkflowDecisionVerifier`

## Signature

```ts
export declare function createEd25519DecisionVerifier(
  options: WorkflowDecisionVerifierOptions,
): WorkflowDecisionVerifier;
```

## Related contracts

- [WorkflowDecisionVerifier](../workflowdecisionverifier/)
- [WorkflowDecisionVerifierOptions](../workflowdecisionverifieroptions/)
