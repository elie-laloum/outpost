---
title: "RecoveryRetentionPolicy"
description: "RecoveryRetentionPolicy — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryRetentionPolicy**. Consultez le [guide récupération et rétention](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryRetentionPolicy } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom             | Type                                               | Présence  | Rôle                                                                             |
| --------------- | -------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `version`       | `1`                                                | Requis    | Version de contrat ou graphe contrôlée par l’appelant.                           |
| `scopes`        | `readonly ("clean-workspaces" \| "closed-logs")[]` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `minAgeMs`      | `number`                                           | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `maxBytes`      | `number \| undefined`                              | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `maxWorkspaces` | `number \| undefined`                              | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface RecoveryRetentionPolicy {
  readonly version: 1;
  readonly scopes: readonly ("clean-workspaces" | "closed-logs")[];
  readonly minAgeMs: number;
  readonly maxBytes?: number;
  readonly maxWorkspaces?: number;
}
```
