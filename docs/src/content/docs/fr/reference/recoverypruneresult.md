---
title: "RecoveryPruneResult"
description: "RecoveryPruneResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryPruneResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                                             | Présence | Rôle                                                                              |
| ---------- | ---------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| `removed`  | `readonly string[]`                                              | Requis   | Chemins réellement supprimés après revalidation de la possession et de la sûreté. |
| `retained` | `readonly { readonly path: string; readonly reason: string; }[]` | Requis   | Candidats laissés en place avec le motif empêchant leur suppression.              |
| `after`    | `RecoveryRetentionPlan`                                          | Requis   | Nouveau plan de rétention calculé après nettoyage, reflétant le stockage restant. |

## Signature

```ts
export interface RecoveryPruneResult {
  readonly removed: readonly string[];
  readonly retained: readonly {
    readonly path: string;
    readonly reason: string;
  }[];
  readonly after: RecoveryRetentionPlan;
}
```

## Contrats associés

- [RecoveryRetentionPlan](../recoveryretentionplan/)
