---
title: "ResourceInspection"
description: "ResourceInspection — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResourceInspection } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                 | Présence | Rôle                                                                                                    |
| ---------- | ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------- |
| `scope`    | `"recorded-sandboxes"`               | Requis   | Toujours recorded-sandboxes : l’inventaire couvre les enregistrements locaux, pas les comptes distants. |
| `complete` | `boolean`                            | Requis   | Indique si toute l’inspection demandée s’est terminée sans limite de parcours ni entrée inaccessible.   |
| `entries`  | `readonly ResourceInspectionEntry[]` | Requis   | Fichiers locaux d’activité de sandbox et évaluations de leur possession.                                |
| `issues`   | `readonly StorageIssue[]`            | Requis   | Problèmes de fichiers, Git ou possession ayant empêché une inspection complète.                         |

## Signature

```ts
export interface ResourceInspection {
  readonly scope: "recorded-sandboxes";
  readonly complete: boolean;
  readonly entries: readonly ResourceInspectionEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Contrats associés

- [ResourceInspectionEntry](../resourceinspectionentry/)
- [StorageIssue](../support-storageissue/)
