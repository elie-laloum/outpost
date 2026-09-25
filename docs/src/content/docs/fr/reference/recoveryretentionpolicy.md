---
title: "RecoveryRetentionPolicy"
description: "RecoveryRetentionPolicy — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRetentionPolicy } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                               | Présence  | Rôle                                                                                                         |
| --------------- | -------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `version`       | `1`                                                | Requis    | Version de ce format d’enregistrement sérialisé ; actuellement 1.                                            |
| `scopes`        | `readonly ("clean-workspaces" \| "closed-logs")[]` | Requis    | Classes de stockage éligibles au nettoyage : workspaces propres et/ou journaux fermés.                       |
| `minAgeMs`      | `number`                                           | Requis    | Âge minimal en millisecondes pour qu’un candidat à la rétention soit éligible.                               |
| `maxBytes`      | `number \| undefined`                              | Optionnel | Taille maximale cible du stockage conservé en octets ; seules les entrées éligibles peuvent être supprimées. |
| `maxWorkspaces` | `number \| undefined`                              | Optionnel | Nombre maximal cible de workspaces conservés ; les entrées risquées restent protégées.                       |

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
