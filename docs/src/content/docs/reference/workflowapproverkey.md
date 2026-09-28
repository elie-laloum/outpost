---
title: "WorkflowApproverKey"
description: "WorkflowApproverKey — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowApproverKey } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type        | Presence | Meaning                                                                                        |
| ----------- | ----------- | -------- | ---------------------------------------------------------------------------------------------- |
| `keyId`     | `string`    | Required | Unique key identifier in the current trusted key set; duplicate identifiers fail verification. |
| `actor`     | `string`    | Required | Only actor authorized to sign decisions with this public key.                                  |
| `publicKey` | `KeyObject` | Required | Ed25519 public KeyObject used to check the proof; the verifier never needs the private key.    |

## Signature

```ts
import type { KeyObject } from "node:crypto";

export interface WorkflowApproverKey {
  readonly keyId: string;
  readonly actor: string;
  readonly publicKey: KeyObject;
}
```
