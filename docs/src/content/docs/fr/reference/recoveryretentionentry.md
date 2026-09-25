---
title: "RecoveryRetentionEntry"
description: "RecoveryRetentionEntry — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryRetentionEntry**. Consultez le [guide récupération et rétention](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryRetentionEntry } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom          | Type                  | Présence  | Rôle                                                                             |
| ------------ | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `path`       | `string`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `category`   | `string`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `bytes`      | `number`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `eligible`   | `boolean`             | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `reason`     | `string`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `branch`     | `string \| undefined` | Optionnel | Politique de workspace Git ou identité de branche résultante selon ce contrat.   |
| `head`       | `string \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `modifiedAt` | `string \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface RecoveryRetentionEntry {
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
