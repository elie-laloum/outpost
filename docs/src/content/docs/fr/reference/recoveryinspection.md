---
title: "RecoveryInspection"
description: "RecoveryInspection — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryInspection**. Consultez le [guide activité des ressources](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryInspection } from "@elie-laloum/outpost";
```

## Rôle et comportement

Lire l’activité enregistrée localement des baux et opérations.

Les observations locales n’énumèrent pas les comptes distants et ne constituent pas un inventaire cloud faisant autorité.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom              | Type                                  | Présence  | Rôle                                                                             |
| ---------------- | ------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `repository`     | `string`                              | Requis    | Checkout Git hôte ciblé.                                                         |
| `activity`       | `"unverified"`                        | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `git`            | `WorkspaceGitInspection \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `locks`          | `LockInspection \| undefined`         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `resources`      | `ResourceInspection \| undefined`     | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `root`           | `string`                              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `categories`     | `readonly StorageCategory[]`          | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `usage`          | `Readonly<StorageUsage>`              | Requis    | Compteurs d’usage rapportés ; aucune estimation monétaire.                       |
| `issues`         | `readonly StorageIssue[]`             | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `complete`       | `boolean`                             | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `scannedEntries` | `number`                              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `maxEntries`     | `number`                              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface RecoveryInspection extends StorageInventory {
  readonly repository: string;
  readonly activity: "unverified";
  readonly git?: WorkspaceGitInspection;
  readonly locks?: LockInspection;
  readonly resources?: ResourceInspection;
}
```

## Contrats associés

- [LockInspection](../support-lockinspection/)
- [ResourceInspection](../resourceinspection/)
- [StorageInventory](../support-storageinventory/)
- [WorkspaceGitInspection](../support-workspacegitinspection/)
