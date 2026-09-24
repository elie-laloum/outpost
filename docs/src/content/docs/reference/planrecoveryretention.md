---
title: "planRecoveryRetention"
description: "planRecoveryRetention — Outpost API"
sidebar:
  order: 10
---

Public contract for **planRecoveryRetention**. See the [recovery and retention guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import { planRecoveryRetention } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function planRecoveryRetention(
  options: RecoveryRetentionOptions,
): Promise<RecoveryRetentionPlan>;
```

## Related contracts

- [RecoveryRetentionOptions](../recoveryretentionoptions/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
