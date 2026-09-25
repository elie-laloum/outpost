---
title: "planRecoveryRetention"
description: "planRecoveryRetention — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { planRecoveryRetention } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect local recovery storage and compute which clean workspaces or closed logs satisfy the supplied age and capacity policy. Planning reports eligibility and projected usage without removing files.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name                 | Type                       | Presence | Meaning                                                                                         |
| -------------------- | -------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `options`            | `RecoveryRetentionOptions` | Required | Repository to inspect, explicit retention policy and scan bound.                                |
| `options.repository` | `string \| undefined`      | Optional | Target host Git checkout.                                                                       |
| `options.policy`     | `RecoveryRetentionPolicy`  | Required | Explicit storage scopes, minimum age and capacity targets used to decide retention eligibility. |
| `options.maxEntries` | `number \| undefined`      | Optional | Maximum filesystem entries inspected before marking the inventory incomplete.                   |

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
