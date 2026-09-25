---
title: "RecoveryInspectionOptions"
description: "RecoveryInspectionOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryInspectionOptions**. Consultez le [guide activité des ressources](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryInspectionOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Lire l’activité enregistrée localement des baux et opérations.

Les observations locales n’énumèrent pas les comptes distants et ne constituent pas un inventaire cloud faisant autorité.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom          | Type                   | Présence  | Rôle                                                                             |
| ------------ | ---------------------- | --------- | -------------------------------------------------------------------------------- |
| `repository` | `string \| undefined`  | Optionnel | Checkout Git hôte ciblé.                                                         |
| `maxEntries` | `number \| undefined`  | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `git`        | `boolean \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `locks`      | `boolean \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `resources`  | `boolean \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface RecoveryInspectionOptions {
  readonly repository?: string;
  readonly maxEntries?: number;
  readonly git?: boolean;
  readonly locks?: boolean;
  readonly resources?: boolean;
}
```
