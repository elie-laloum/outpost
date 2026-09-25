---
title: "StorageUsage"
description: "StorageUsage — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom           | Type     | Présence | Rôle                                                                             |
| ------------- | -------- | -------- | -------------------------------------------------------------------------------- |
| `bytes`       | `number` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `files`       | `number` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `directories` | `number` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `symlinks`    | `number` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `other`       | `number` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface StorageUsage {
  bytes: number;
  files: number;
  directories: number;
  symlinks: number;
  other: number;
}
```
