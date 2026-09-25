---
title: "StorageIssue"
description: "StorageIssue — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom    | Type     | Présence | Rôle                                                                |
| ------ | -------- | -------- | ------------------------------------------------------------------- |
| `path` | `string` | Requis   | Chemin de fichiers où l’inspection a rencontré un problème.         |
| `code` | `string` | Requis   | Code d’erreur de fichiers ou d’inspection de l’entrée inaccessible. |

## Signature

```ts
export interface StorageIssue {
  readonly path: string;
  readonly code: string;
}
```
