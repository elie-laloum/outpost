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

| Nom              | Type                                  | Présence  | Rôle                                                                                                                                                                                                                                           |
| ---------------- | ------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`         | `"transport" \| undefined`            | Optionnel | transport pour un plan construit avec un transporter ; absent pour un plan local. pruneRecoveryRetention() exige alors le même transporter.                                                                                                    |
| `repository`     | `string`                              | Requis    | Chemin racine du checkout inspecté ; pour un plan de transport, l’option repository telle quelle, ou une chaîne vide.                                                                                                                          |
| `policy`         | `RecoveryRetentionPolicy`             | Requis    | Copie de la politique validée ; le nettoyage et son plan after la réutilisent.                                                                                                                                                                 |
| `inspectedAt`    | `string`                              | Requis    | Horodatage ISO pris après l’inventaire ; l’âge des entrées est mesuré à partir de lui.                                                                                                                                                         |
| `inspection`     | `RecoveryInspection`                  | Requis    | Inventaire sur lequel repose le plan, avec les rapports de worktrees Git, de verrous et d’activité des ressources pour un plan local.                                                                                                          |
| `entries`        | `readonly RecoveryRetentionEntry[]`   | Requis    | Une entrée par élément inventorié, avec éligibilité, code de motif et octets.                                                                                                                                                                  |
| `complete`       | `boolean`                             | Requis    | Indique si l’inventaire, les contrôles des worktrees Git et la taille des objets de journal ont tous été lus dans la limite maxEntries. À false, aucune entrée n’est éligible, quota vaut unknown et pruneRecoveryRetention() rejette le plan. |
| `usageBytes`     | `number`                              | Requis    | Octets observés à l’inspection : taille des fichiers sous .outpost, ou des objets du transport.                                                                                                                                                |
| `projectedBytes` | `number`                              | Requis    | usageBytes moins les octets des entrées éligibles : l’usage restant si chaque candidat est supprimé.                                                                                                                                           |
| `quota`          | `"unknown" \| "within" \| "exceeded"` | Requis    | exceeded quand projectedBytes dépasse maxBytes ou que les worktrees restants dépassent maxWorkspaces, unknown si l’inventaire est incomplet, sinon within.                                                                                     |

## Signature

```ts
export interface RecoveryRetentionPlan {
  readonly source?: "transport";
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
