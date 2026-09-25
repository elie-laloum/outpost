---
title: "Volume"
description: "Volume — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Volume**. Consultez le [guide providers](../../guide/environment/providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Volume } from "@elie-laloum/outpost";
```

## Rôle et comportement

Allouer conteneurs locaux, exécution hôte explicite ou sandboxes distantes via les sous-chemins du package.

Les providers montés et hôtes utilisent current par défaut ; les distants utilisent integrate et rejettent current. Les SDK optionnels restent optionnels. L’exécution locale ne fournit aucune isolation.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom        | Type                   | Présence  | Rôle                                                                             |
| ---------- | ---------------------- | --------- | -------------------------------------------------------------------------------- |
| `source`   | `string`               | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `target`   | `string`               | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `readOnly` | `boolean \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface Volume {
  readonly source: string;
  readonly target: string;
  readonly readOnly?: boolean;
}
```
