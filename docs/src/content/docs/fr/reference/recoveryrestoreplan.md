---
title: "RecoveryRestorePlan"
description: "RecoveryRestorePlan — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryRestorePlan**. Consultez le [guide restauration de récupération](../../operations/recovery-restoration/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryRestorePlan } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryRestorePlan extends RecoveryRestoreOptions {
  readonly fingerprint: string;
  readonly manifestSha256: string;
  readonly commit: string;
  readonly payloads: readonly string[];
  readonly staging: "preserved" | "unavailable";
}
```

## Contrats associés

- [RecoveryRestoreOptions](../recoveryrestoreoptions/)
