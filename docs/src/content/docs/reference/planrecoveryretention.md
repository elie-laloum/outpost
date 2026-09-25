---
title: "planRecoveryRetention"
description: "planRecoveryRetention — Outpost API"
sidebar:
  order: 10
---

Public contract for **planRecoveryRetention**. See the [recovery and retention guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import { planRecoveryRetention } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name                 | Type                       | Presence | Meaning                                                                                  |
| -------------------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`            | `RecoveryRetentionOptions` | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.repository` | `string \| undefined`      | Optional | Target host Git checkout.                                                                |
| `options.policy`     | `RecoveryRetentionPolicy`  | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.maxEntries` | `number \| undefined`      | Optional | See the linked contract and this family's rules for its interpretation.                  |

## Returns

`Promise<RecoveryRetentionPlan>`

## Signature

```ts
export declare function planRecoveryRetention(
  options: RecoveryRetentionOptions,
): Promise<RecoveryRetentionPlan>;
```

## Related contracts

- [RecoveryRetentionOptions](../recoveryretentionoptions/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
