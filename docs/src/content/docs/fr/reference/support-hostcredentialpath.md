---
title: "HostCredentialPath"
description: "HostCredentialPath — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom    | Type                                                                 | Présence  | Rôle                                                                                                                           |
| ------ | -------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `path` | `string`                                                             | Requis    | Chemin hôte par défaut ; ~ désigne le home de l’hôte.                                                                          |
| `home` | `{ readonly variable: string; readonly path: string; } \| undefined` | Optionnel | Variable d’environnement qui déplace le home de la CLI sur l’hôte (par exemple CODEX_HOME) et chemin du fichier à l’intérieur. |

## Signature

```ts
export interface HostCredentialPath {
  readonly path: string;
  readonly home?: {
    readonly variable: string;
    readonly path: string;
  };
}
```
