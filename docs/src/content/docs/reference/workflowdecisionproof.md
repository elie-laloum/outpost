---
title: "WorkflowDecisionProof"
description: "WorkflowDecisionProof — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowDecisionProof } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type     | Presence | Meaning                                                                     |
| ----------- | -------- | -------- | --------------------------------------------------------------------------- |
| `keyId`     | `string` | Required | Trusted approver key identifier bound into the signature.                   |
| `expiresAt` | `string` | Required | Signed expiration timestamp; verification rejects at or after this instant. |
| `signature` | `string` | Required | Base64url Ed25519 signature of the versioned canonical decision payload.    |

## Signature

```ts
export interface WorkflowDecisionProof {
  readonly keyId: string;
  readonly expiresAt: string;
  readonly signature: string;
}
```
