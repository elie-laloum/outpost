---
title: "StorageIssue"
description: "StorageIssue — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom    | Type     | Présence | Rôle                                                                                                                                                         |
| ------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `path` | `string` | Requis   | Chemin ou clé d’objet qui n’a pas pu être entièrement inspecté ; vide pour le problème ENTRY_LIMIT d’un inventaire de transport.                             |
| `code` | `string` | Requis   | Code du motif : un code d’erreur du système de fichiers tel que EACCES, ou un code Outpost tel que ENTRY_LIMIT, DEPTH_LIMIT, GIT_LIST_FAILED ou INVALID_PID. |

## Signature

```ts
export interface StorageIssue {
  readonly path: string;
  readonly code: string;
}
```
