---
title: "RecoveryRetentionOptions"
description: "RecoveryRetentionOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryRetentionOptions**. See the [recovery and retention guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryRetentionOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name         | Type                      | Presence | Meaning                                                                 |
| ------------ | ------------------------- | -------- | ----------------------------------------------------------------------- |
| `repository` | `string \| undefined`     | Optional | Target host Git checkout.                                               |
| `policy`     | `RecoveryRetentionPolicy` | Required | See the linked contract and this family's rules for its interpretation. |
| `maxEntries` | `number \| undefined`     | Optional | See the linked contract and this family's rules for its interpretation. |

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
