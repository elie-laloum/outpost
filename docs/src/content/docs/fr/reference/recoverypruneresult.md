---
title: "RecoveryPruneResult"
description: "RecoveryPruneResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryPruneResult**. Consultez le [guide récupération et rétention](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryPruneResult } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom        | Type                                                             | Présence | Rôle                                                                             |
| ---------- | ---------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `removed`  | `readonly string[]`                                              | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `retained` | `readonly { readonly path: string; readonly reason: string; }[]` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `after`    | `RecoveryRetentionPlan`                                          | Requis   | Dépendances déclarées dont les valeurs peuvent être lues.                        |

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
