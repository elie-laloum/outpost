---
title: "RecoveryRetentionEntry"
description: "RecoveryRetentionEntry — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryRetentionEntry**. Consultez le [guide récupération et rétention](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryRetentionEntry } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryRetentionEntry {
  readonly path: string;
  readonly category: string;
  readonly bytes: number;
  readonly eligible: boolean;
  readonly reason: string;
  readonly branch?: string;
  readonly head?: string;
  readonly modifiedAt?: string;
}
```
