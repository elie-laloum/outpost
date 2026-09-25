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

Applique un plan de rétention préalablement examiné. Reprend possession et revalide chaque candidat avant suppression ; renvoie les chemins supprimés, les entrées conservées et un nouveau plan après nettoyage.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom    | Type                    | Présence | Rôle                                                                                                          |
| ------ | ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `plan` | `RecoveryRetentionPlan` | Requis   | Plan de rétention préalablement calculé dont les entrées éligibles doivent être revalidées avant suppression. |

## Retour

`Promise<RecoveryPruneResult>`

## Signature

```ts
export declare function pruneRecoveryRetention(
  plan: RecoveryRetentionPlan,
): Promise<RecoveryPruneResult>;
```

## Contrats associés

- [RecoveryPruneResult](../recoverypruneresult/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
