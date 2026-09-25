---
title: "RecoveryRetentionPlan"
description: "RecoveryRetentionPlan — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRetentionPlan } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                  | Présence | Rôle                                                                                                                      |
| ---------------- | ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `repository`     | `string`                              | Requis   | Checkout Git hôte ciblé.                                                                                                  |
| `policy`         | `RecoveryRetentionPolicy`             | Requis   | Périmètres de stockage, âge minimal et cibles de capacité explicites utilisés pour déterminer l’éligibilité au nettoyage. |
| `inspectedAt`    | `string`                              | Requis   | Horodatage ISO de l’inventaire de rétention.                                                                              |
| `inspection`     | `RecoveryInspection`                  | Requis   | Inventaire complet de récupération sur lequel reposent les décisions de rétention.                                        |
| `entries`        | `readonly RecoveryRetentionEntry[]`   | Requis   | Candidats au nettoyage avec éligibilité, motif de sûreté et taille observée.                                              |
| `complete`       | `boolean`                             | Requis   | Indique si toute l’inspection demandée s’est terminée sans limite de parcours ni entrée inaccessible.                     |
| `usageBytes`     | `number`                              | Requis   | Nombre total d’octets observés avant application du plan de rétention.                                                    |
| `projectedBytes` | `number`                              | Requis   | Estimation des octets conservés après suppression de tous les candidats éligibles.                                        |
| `quota`          | `"unknown" \| "within" \| "exceeded"` | Requis   | Indique si l’usage projeté respecte la limite, la dépasse ou reste inconnu faute d’inspection complète.                   |

## Signature

```ts
export interface RecoveryRetentionPlan {
  readonly repository: string;
  readonly policy: RecoveryRetentionPolicy;
  readonly inspectedAt: string;
  readonly inspection: RecoveryInspection;
  readonly entries: readonly RecoveryRetentionEntry[];
  readonly complete: boolean;
  readonly usageBytes: number;
  readonly projectedBytes: number;
  readonly quota: "within" | "exceeded" | "unknown";
}
```

## Contrats associés

- [RecoveryInspection](../recoveryinspection/)
- [RecoveryRetentionEntry](../recoveryretentionentry/)
- [RecoveryRetentionPolicy](../recoveryretentionpolicy/)
