---
title: "RecoveryRetentionPlan"
description: "RecoveryRetentionPlan — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryRetentionPlan**. Consultez le [guide récupération et rétention](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryRetentionPlan } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom              | Type                                  | Présence | Rôle                                                                             |
| ---------------- | ------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `repository`     | `string`                              | Requis   | Checkout Git hôte ciblé.                                                         |
| `policy`         | `RecoveryRetentionPolicy`             | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `inspectedAt`    | `string`                              | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `inspection`     | `RecoveryInspection`                  | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `entries`        | `readonly RecoveryRetentionEntry[]`   | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `complete`       | `boolean`                             | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `usageBytes`     | `number`                              | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `projectedBytes` | `number`                              | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `quota`          | `"unknown" \| "within" \| "exceeded"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
