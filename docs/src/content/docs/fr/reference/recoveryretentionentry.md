---
title: "RecoveryRetentionEntry"
description: "RecoveryRetentionEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRetentionEntry } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                     | Présence  | Rôle                                                                                                                  |
| ------------ | ---------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| `revision`   | `string \| undefined`                    | Optionnel | Révision attendue de l’index du journal, vérifiée de nouveau avant suppression en mode transport.                     |
| `objects`    | `readonly TransportEntry[] \| undefined` | Optionnel | Index et segments versionnés d’un journal distant ; la suppression revalide le groupe et la révision de chaque objet. |
| `path`       | `string`                                 | Requis    | Chemin hôte de l’entrée de stockage inspectée.                                                                        |
| `category`   | `string`                                 | Requis    | Catégorie de stockage du candidat à la rétention.                                                                     |
| `bytes`      | `number`                                 | Requis    | Octets observés attribuables à ce candidat à la rétention.                                                            |
| `eligible`   | `boolean`                                | Requis    | Indique si le candidat a passé les contrôles de sûreté, périmètre et âge autorisant sa suppression.                   |
| `reason`     | `string`                                 | Requis    | Explication de l’éligibilité du candidat au nettoyage ou de la nécessité de le protéger.                              |
| `branch`     | `string \| undefined`                    | Optionnel | Nom de la branche de travail utilisée ou observée pendant l’exécution.                                                |
| `head`       | `string \| undefined`                    | Optionnel | Commit Git HEAD enregistré par l’inspection ou le snapshot.                                                           |
| `modifiedAt` | `string \| undefined`                    | Optionnel | Horodatage ISO de la dernière modification de l’entrée inspectée.                                                     |

## Signature

```ts
export interface RecoveryRetentionEntry {
  readonly revision?: string;
  readonly objects?: readonly TransportEntry[];
  readonly path: string;
  readonly category: string;
  readonly bytes: number;
  readonly eligible: boolean;
  readonly reason: string;
  readonly branch?: string;
  readonly head?: string;
  readonly modifiedAt?: string;
}
```

## Contrats associés

- [TransportEntry](../transportentry/)
