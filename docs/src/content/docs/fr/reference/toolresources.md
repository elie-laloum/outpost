---
title: "ToolResources"
description: "ToolResources — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ToolResources } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                             | Présence  | Rôle                                                                                     |
| --------- | -------------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `paths`   | `readonly string[] \| undefined` | Optionnel | Chemins relatifs au dépôt que l’appel lit ou écrit.                                      |
| `command` | `string \| undefined`            | Optionnel | Ligne de commande exécutée par l’appel, pour les règles de permission sur les commandes. |

## Signature

```ts
export interface ToolResources {
  readonly paths?: readonly string[];
  readonly command?: string;
}
```
