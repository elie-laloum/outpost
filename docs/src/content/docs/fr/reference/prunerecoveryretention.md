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

Supprime les entrées éligibles d’un plan complet, en revérifiant chacune contre un nouveau plan ; un candidat modifié ou en échec est conservé avec son motif. Les worktrees sont supprimés sous le verrou de leur branche, qui est conservée ; les objets de journal et de cache sont effacés par écritures conditionnelles. Un plan incomplet ou un transporter qui ne correspond pas au source du plan rejette avec le code configuration.

[Exemple complet et règles détaillées](../../guide/retention/).

## Paramètres et propriétés

| Nom                   | Type                                 | Présence  | Rôle                                                                                                                                        |
| --------------------- | ------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `plan`                | `RecoveryRetentionPlan`              | Requis    | Plan complet issu de planRecoveryRetention() ; seules ses entrées éligibles sont candidates.                                                |
| `options`             | `TransportStoreOptions \| undefined` | Optionnel | { transporter } ayant servi à construire un plan dont source vaut transport ; à omettre pour un plan local.                                 |
| `options.transporter` | `Transport`                          | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |
| `observation`         | `ObservationHub \| undefined`        | Optionnel | Hub recevant l’événement d’opération retention.prune au démarrage, puis à la fin ou en échec avec sa durée.                                 |

## Retour

`Promise<RecoveryPruneResult>`

## Signature

```ts
export declare function pruneRecoveryRetention(
  plan: RecoveryRetentionPlan,
  options?: TransportStoreOptions,
  observation?: ObservationHub,
): Promise<RecoveryPruneResult>;
```

## Contrats associés

- [ObservationHub](../observationhub/)
- [RecoveryPruneResult](../recoverypruneresult/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
- [TransportStoreOptions](../transportstoreoptions/)
