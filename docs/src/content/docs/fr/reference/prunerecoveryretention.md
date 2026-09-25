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

Applique un plan de rétention après revalidation. Les plans locaux reprennent la propriété des fichiers ; les plans distants exigent le même transport en second argument, revalident les groupes de journaux fermés et conditionnent chaque suppression à sa révision. Les candidats modifiés ou partiellement supprimés sont signalés comme conservés ; les données de récupération restent protégées.

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
