---
title: "RecoveryRestoreResult"
description: "RecoveryRestoreResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryRestoreResult**. Consultez le [guide restauration de récupération](../../operations/recovery-restoration/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryRestoreResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryRestoreResult {
  readonly directory: string;
  readonly commit: string;
  readonly side: "previous" | "incoming";
  readonly staging: "preserved" | "unavailable";
  readonly sourceRetained: true;
}
```
