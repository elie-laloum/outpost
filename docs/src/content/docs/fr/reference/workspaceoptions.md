---
title: "WorkspaceOptions"
description: "WorkspaceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                                     | Présence  | Rôle                                                                                                           |
| -------------- | -------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| `storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Limites d’admission et réservation demandée pour le stockage dans .outpost du dépôt.                           |
| `signal`       | `AbortSignal \| undefined`                               | Optionnel | Annulation coopérative de cette opération.                                                                     |
| `repository`   | `string \| undefined`                                    | Optionnel | Checkout Git hôte ciblé.                                                                                       |
| `branch`       | `BranchPolicy \| undefined`                              | Optionnel | Choisit le checkout courant, une branche de travail nommée conservée ou une branche préparée pour intégration. |
| `copies`       | `readonly string[] \| undefined`                         | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                                                          |
| `limits`       | `StageLimits \| undefined`                               | Optionnel | Délais de copie, préparation Git, collecte des commits et intégration, en millisecondes.                       |
| `label`        | `string \| undefined`                                    | Optionnel | Libellé lisible utilisé dans les rapports d’exécution.                                                         |
| `hooks`        | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                                                |

## Signature

```ts
export interface WorkspaceOptions {
  readonly storageQuota?: Omit<StorageReservationOptions, "signal">;
  readonly signal?: AbortSignal;
  readonly repository?: string;
  readonly branch?: BranchPolicy;
  readonly copies?: readonly string[];
  readonly limits?: StageLimits;
  readonly label?: string;
  readonly hooks?: LifecycleHooks;
}
```

## Contrats associés

- [BranchPolicy](../branchpolicy/)
- [LifecycleHooks](../lifecyclehooks/)
- [StageLimits](../stagelimits/)
- [StorageReservationOptions](../storagereservationoptions/)
