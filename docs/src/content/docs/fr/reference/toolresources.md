---
title: "ToolResources"
description: "ToolResources — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
:::

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
