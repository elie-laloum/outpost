---
title: "WorkspacePathGate"
description: "WorkspacePathGate — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom      | Type     | Présence | Rôle                                                                                     |
| -------- | -------- | -------- | ---------------------------------------------------------------------------------------- |
| `device` | `number` | Requis   | Composante d’identité filesystem capturée avec lstat, sans suivre l’entrée sélectionnée. |
| `inode`  | `number` | Requis   | Composante d’identité filesystem capturée avec lstat, sans suivre l’entrée sélectionnée. |

## Signature

```ts
export interface WorkspacePathGate {
  readonly device: number;
  readonly inode: number;
}
```
