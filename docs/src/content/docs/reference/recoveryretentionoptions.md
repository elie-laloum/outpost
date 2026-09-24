---
title: "RecoveryRetentionOptions"
description: "RecoveryRetentionOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryRetentionOptions**. See the [recovery and retention guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryRetentionOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryRetentionOptions {
  readonly repository?: string;
  readonly policy: RecoveryRetentionPolicy;
  readonly maxEntries?: number;
}
```

## Related contracts

- [RecoveryRetentionPolicy](../recoveryretentionpolicy/)
