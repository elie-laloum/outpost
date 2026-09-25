---
title: "RecoveryRetentionOptions"
description: "RecoveryRetentionOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRetentionOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                      | Presence | Meaning                                                                                         |
| ------------ | ------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `repository` | `string \| undefined`     | Optional | Target host Git checkout.                                                                       |
| `policy`     | `RecoveryRetentionPolicy` | Required | Explicit storage scopes, minimum age and capacity targets used to decide retention eligibility. |
| `maxEntries` | `number \| undefined`     | Optional | Maximum filesystem entries inspected before marking the inventory incomplete.                   |

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
