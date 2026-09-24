---
title: "pruneRecoveryRetention"
description: "pruneRecoveryRetention — Outpost API"
sidebar:
  order: 10
---

Public contract for **pruneRecoveryRetention**. See the [recovery and retention guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import { pruneRecoveryRetention } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function pruneRecoveryRetention(
  plan: RecoveryRetentionPlan,
): Promise<RecoveryPruneResult>;
```

## Related contracts

- [RecoveryPruneResult](../recoverypruneresult/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
