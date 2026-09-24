---
title: "RecoveryRetentionOptions"
description: "RecoveryRetentionOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryRetentionOptions**. Consultez le [guide récupération et rétention](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [RecoveryRetentionPolicy](../recoveryretentionpolicy/)
