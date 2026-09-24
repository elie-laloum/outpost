---
title: "RecoveryRestoreOptions"
description: "RecoveryRestoreOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryRestoreOptions**. Consultez le [guide restauration de récupération](../../operations/recovery-restoration/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryRestoreOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryRestoreOptions {
  readonly directory: string;
  readonly repository: string;
  readonly destination: string;
  readonly side: "previous" | "incoming";
  readonly maxBytes?: number;
}
```
