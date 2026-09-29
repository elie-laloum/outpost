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

| Nom    | Type     | Présence | Rôle                                                                                                                                                       |
| ------ | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` | `string` | Requis   | Nom du cache et de son répertoire sous /outpost/cache : jusqu’à 48 lettres minuscules, chiffres ou tirets, commençant par une lettre, unique par provider. |
| `key`  | `string` | Requis   | Clé d’invalidation de 1 à 1024 caractères ; la changer sélectionne un nouveau volume du moteur.                                                            |

## Signature

```ts
export interface DependencyCache {
  readonly name: string;
  readonly key: string;
}
```
