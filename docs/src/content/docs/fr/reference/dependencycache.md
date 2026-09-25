---
title: "DependencyCache"
description: "DependencyCache — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DependencyCache } from "@elie-laloum/outpost/providers/docker";
import type { DependencyCache } from "@elie-laloum/outpost/providers/podman";
```

## Paramètres et propriétés

| Nom    | Type     | Présence | Rôle                                                                                                                                             |
| ------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name` | `string` | Requis   | Nom logique de cache utilisé dans le chemin de montage ; le nom du volume moteur est déduit du dépôt, de l’image, de l’utilisateur et de la clé. |
| `key`  | `string` | Requis   | Clé d’invalidation du cache définie par l’appelant ; sa modification sélectionne un nouveau volume moteur.                                       |

## Signature

```ts
export interface DependencyCache {
  readonly name: string;
  readonly key: string;
}
```
