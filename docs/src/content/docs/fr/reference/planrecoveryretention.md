---
title: "planRecoveryRetention"
description: "planRecoveryRetention — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { planRecoveryRetention } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecte le stockage local de récupération et détermine quels workspaces propres ou journaux fermés satisfont la politique d’âge et de capacité. Le plan expose éligibilité et usage projeté sans supprimer de fichier.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom                  | Type                       | Présence  | Rôle                                                                                                                      |
| -------------------- | -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `RecoveryRetentionOptions` | Requis    | Dépôt à inspecter, politique de rétention explicite et limite de parcours.                                                |
| `options.repository` | `string \| undefined`      | Optionnel | Checkout Git hôte ciblé.                                                                                                  |
| `options.policy`     | `RecoveryRetentionPolicy`  | Requis    | Périmètres de stockage, âge minimal et cibles de capacité explicites utilisés pour déterminer l’éligibilité au nettoyage. |
| `options.maxEntries` | `number \| undefined`      | Optionnel | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet.                                 |

## Retour

`Promise<RecoveryRetentionPlan>`

## Signature

```ts
export declare function planRecoveryRetention(
  options: RecoveryRetentionOptions,
): Promise<RecoveryRetentionPlan>;
```

## Contrats associés

- [RecoveryRetentionOptions](../recoveryretentionoptions/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
