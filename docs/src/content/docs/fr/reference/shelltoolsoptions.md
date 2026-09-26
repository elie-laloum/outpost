---
title: "ShellToolsOptions"
description: "ShellToolsOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { ShellToolsOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                  | Présence  | Rôle                                                                                                                   |
| ------------ | --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `deadlineMs` | `number \| undefined` | Optionnel | Délai de chaque commande shell en millisecondes ; 120 000 par défaut. Le délai des outils du harness s’applique aussi. |

## Signature

```ts
export interface ShellToolsOptions {
  readonly deadlineMs?: number;
}
```
