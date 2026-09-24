---
title: "RecoveryRetentionPolicy"
description: "RecoveryRetentionPolicy — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryRetentionPolicy**. Consultez le [guide récupération et rétention](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryRetentionPolicy } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryRetentionPolicy {
  readonly version: 1;
  readonly scopes: readonly ("clean-workspaces" | "closed-logs")[];
  readonly minAgeMs: number;
  readonly maxBytes?: number;
  readonly maxWorkspaces?: number;
}
```
