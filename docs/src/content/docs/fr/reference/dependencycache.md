---
title: "DependencyCache"
description: "DependencyCache — Outpost API"
sidebar:
  order: 10
---

Contrat public de **DependencyCache**. Consultez le [guide providers](../../guide/environment/providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { DependencyCache } from "@elie-laloum/outpost/providers/docker";
import type { DependencyCache } from "@elie-laloum/outpost/providers/podman";
```

## Rôle et comportement

Allouer conteneurs locaux, exécution hôte explicite ou sandboxes distantes via les sous-chemins du package.

Les providers montés et hôtes utilisent current par défaut ; les distants utilisent integrate et rejettent current. Les SDK optionnels restent optionnels. L’exécution locale ne fournit aucune isolation.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom    | Type     | Présence | Rôle                                                                             |
| ------ | -------- | -------- | -------------------------------------------------------------------------------- |
| `name` | `string` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `key`  | `string` | Requis   | Clé stable de tâche ou cache dans le contrat concerné.                           |

## Signature

```ts
export interface DependencyCache {
  readonly name: string;
  readonly key: string;
}
```
