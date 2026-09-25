---
title: "TransportReference"
description: "TransportReference — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransportReference } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type     | Présence | Rôle                                                                                                           |
| ---------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `key`      | `string` | Requis   | Clé logique dans le transport configuré ; la référence ne contient ni identifiants ni client du backend.       |
| `revision` | `string` | Requis   | Révision exacte à lire ; un remplacement est refusé au lieu de modifier silencieusement le résultat référencé. |

## Signature

```ts
export interface TransportReference {
  readonly key: string;
  readonly revision: string;
}
```
