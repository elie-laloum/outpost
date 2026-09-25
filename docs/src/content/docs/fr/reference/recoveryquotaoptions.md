---
title: "RecoveryQuotaOptions"
description: "RecoveryQuotaOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryQuotaOptions**. Consultez le [guide récupération et rétention](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryQuotaOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom            | Type                  | Présence  | Rôle                                                                             |
| -------------- | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `repository`   | `string \| undefined` | Optionnel | Checkout Git hôte ciblé.                                                         |
| `maxBytes`     | `number`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `reserveBytes` | `number \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `maxEntries`   | `number \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface RecoveryQuotaOptions {
  readonly repository?: string;
  readonly maxBytes: number;
  readonly reserveBytes?: number;
  readonly maxEntries?: number;
}
```
