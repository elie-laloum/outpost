---
title: "GeneratedCredential"
description: "GeneratedCredential — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom       | Type     | Présence | Rôle                                                   |
| --------- | -------- | -------- | ------------------------------------------------------ |
| `path`    | `string` | Requis   | Chemin de fichier relatif au home privé de la sandbox. |
| `content` | `string` | Requis   | Contenu fixe du fichier, écrit avec le mode 0600.      |

## Signature

```ts
export interface GeneratedCredential {
  readonly path: string;
  readonly content: string;
}
```
