---
title: "RecoveryQuotaOptions"
description: "RecoveryQuotaOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryQuotaOptions**. Consultez le [guide récupération et rétention](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryQuotaOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryQuotaOptions {
  readonly repository?: string;
  readonly maxBytes: number;
  readonly reserveBytes?: number;
  readonly maxEntries?: number;
}
```
