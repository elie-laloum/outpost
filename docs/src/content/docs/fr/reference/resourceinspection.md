---
title: "ResourceInspection"
description: "ResourceInspection — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ResourceInspection**. Consultez le [guide activité des ressources](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ResourceInspection } from "@elie-laloum/outpost";
```

## Rôle et comportement

Lire l’activité enregistrée localement des baux et opérations.

Les observations locales n’énumèrent pas les comptes distants et ne constituent pas un inventaire cloud faisant autorité.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom        | Type                                 | Présence | Rôle                                                                             |
| ---------- | ------------------------------------ | -------- | -------------------------------------------------------------------------------- |
| `scope`    | `"recorded-sandboxes"`               | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `complete` | `boolean`                            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `entries`  | `readonly ResourceInspectionEntry[]` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `issues`   | `readonly StorageIssue[]`            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
