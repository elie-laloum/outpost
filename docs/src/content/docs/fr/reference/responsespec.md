---
title: "ResponseSpec"
description: "ResponseSpec — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResponseSpec } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                           | Présence | Rôle                                                                                                                                                                                                           |
| --------- | ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`     | `string`                       | Requis   | Nom de la balise, sans chevrons. Le brief doit contenir sa balise ouvrante, sinon le dispatch échoue avec le code configuration avant le démarrage de la sandbox.                                              |
| `repairs` | `number`                       | Requis   | Tours de correction autorisés après une réponse invalide, 0 sauf indication contraire dans les options. Chacun reprend la même conversation et ne demande que la balise corrigée.                              |
| `read`    | `(text: string) => Promise<T>` | Requis   | Extrait la dernière paire &lt;tag>…&lt;/tag> complète d’un texte, la nettoie de ses espaces aux bords et l’analyse. Rejette avec ResponseError si aucune paire complète n’existe ou si son contenu est refusé. |

## Signature

```ts
export interface ResponseSpec<T> {
  readonly tag: string;
  readonly repairs: number;
  read(text: string): Promise<T>;
}
```
