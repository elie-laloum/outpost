---
title: "HarnessToolsetOptions"
description: "HarnessToolsetOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessToolsetOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type                                                  | Présence | Rôle                                                                  |
| ------- | ----------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| `name`  | `string`                                              | Requis   | Nom non vide qui identifie le jeu d’outils.                           |
| `tools` | `readonly (HarnessTool<unknown> \| HarnessToolset)[]` | Requis   | Outils et jeux imbriqués à regrouper ; les noms doivent être uniques. |

## Signature

```ts
export interface HarnessToolsetOptions {
  readonly name: string;
  readonly tools: readonly (HarnessTool | HarnessToolset)[];
}
```

## Contrats associés

- [HarnessTool](../harnesstool/)
- [HarnessToolset](../harnesstoolset/)
