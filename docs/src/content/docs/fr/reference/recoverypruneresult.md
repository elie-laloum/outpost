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

| Nom        | Type                                                             | Présence | Rôle                                                                                                |
| ---------- | ---------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `removed`  | `readonly string[]`                                              | Requis   | Chemins ou clés d’objets supprimés.                                                                 |
| `retained` | `readonly { readonly path: string; readonly reason: string; }[]` | Requis   | Candidats éligibles laissés en place, avec le motif PLAN_CHANGED ou REVALIDATION_OR_REMOVAL_FAILED. |
| `after`    | `RecoveryRetentionPlan`                                          | Requis   | Nouveau plan avec la même politique, calculé après le nettoyage.                                    |

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
