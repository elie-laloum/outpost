---
title: "ResourceInspectionEntry"
description: "ResourceInspectionEntry — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ResourceInspectionEntry**. Consultez le [guide activité des ressources](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ResourceInspectionEntry } from "@elie-laloum/outpost";
```

## Rôle et comportement

Lire l’activité enregistrée localement des baux et opérations.

Les observations locales n’énumèrent pas les comptes distants et ne constituent pas un inventaire cloud faisant autorité.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom         | Type                                  | Présence  | Rôle                                                                             |
| ----------- | ------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `path`      | `string`                              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `record`    | `ResourceActivityRecord \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `ownership` | `LockOwnership`                       | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface ResourceInspectionEntry {
  readonly path: string;
  readonly record?: ResourceActivityRecord;
  readonly ownership: LockOwnership;
}
```

## Contrats associés

- [LockOwnership](../support-lockownership/)
- [ResourceActivityRecord](../resourceactivityrecord/)
