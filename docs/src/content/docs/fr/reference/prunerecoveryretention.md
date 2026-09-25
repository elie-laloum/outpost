---
title: "pruneRecoveryRetention"
description: "pruneRecoveryRetention — Outpost API"
sidebar:
  order: 10
---

Contrat public de **pruneRecoveryRetention**. Consultez le [guide récupération et rétention](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { pruneRecoveryRetention } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom    | Type                    | Présence | Rôle                                                                             |
| ------ | ----------------------- | -------- | -------------------------------------------------------------------------------- |
| `plan` | `RecoveryRetentionPlan` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
