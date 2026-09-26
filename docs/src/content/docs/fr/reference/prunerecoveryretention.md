---
title: "pruneRecoveryRetention"
description: "pruneRecoveryRetention — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { pruneRecoveryRetention } from "@elie-laloum/outpost";
```

## Rôle et comportement

Applique un plan après revalidation. La suppression d’un worktree reprend le verrou de branche Git. Les journaux locaux et distants utilisent des suppressions conditionnelles d’objets ; un plan de transport explicite exige le même transport en second argument. Les candidats modifiés ou partiellement supprimés sont conservés ; les données de récupération restent protégées.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom                   | Type                                 | Présence  | Rôle                                                                                                                                        |
| --------------------- | ------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `plan`                | `RecoveryRetentionPlan`              | Requis    | Plan de rétention préalablement calculé dont les entrées éligibles doivent être revalidées avant suppression.                               |
| `options`             | `TransportStoreOptions \| undefined` | Optionnel | Transport requis pour un plan dont source vaut transport ; omis pour un plan de rétention locale.                                           |
| `options.transporter` | `Transport`                          | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Retour

`Promise<RecoveryPruneResult>`

## Signature

```ts
export declare function pruneRecoveryRetention(
  plan: RecoveryRetentionPlan,
  options?: TransportStoreOptions,
): Promise<RecoveryPruneResult>;
```

## Contrats associés

- [RecoveryPruneResult](../recoverypruneresult/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
- [TransportStoreOptions](../transportstoreoptions/)
