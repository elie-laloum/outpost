---
title: "StorageUsage"
description: "StorageUsage — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom           | Type     | Présence | Rôle                                                                                    |
| ------------- | -------- | -------- | --------------------------------------------------------------------------------------- |
| `bytes`       | `number` | Requis   | Total des octets observés dans les entrées parcourues.                                  |
| `files`       | `number` | Requis   | Nombre de fichiers ordinaires comptés dans le stockage parcouru.                        |
| `directories` | `number` | Requis   | Nombre de dossiers comptés dans le stockage parcouru.                                   |
| `symlinks`    | `number` | Requis   | Nombre de liens symboliques comptés sans parcourir leurs cibles.                        |
| `other`       | `number` | Requis   | Nombre d’entrées qui ne sont ni fichiers ordinaires, ni dossiers, ni liens symboliques. |

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
