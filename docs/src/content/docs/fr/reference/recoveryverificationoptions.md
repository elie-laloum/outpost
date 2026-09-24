---
title: "RecoveryVerificationOptions"
description: "RecoveryVerificationOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryVerificationOptions**. Consultez le [guide récupération et rétention](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryVerificationOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryVerificationOptions {
  readonly restorability?: boolean;
  readonly repository?: string;
  readonly checksums?: boolean;
  readonly maxBytes?: number;
}
```
