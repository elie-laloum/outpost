---
title: "HarnessToolset"
description: "HarnessToolset — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessToolset } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type                              | Présence | Rôle                                     |
| ------- | --------------------------------- | -------- | ---------------------------------------- |
| `kind`  | `"toolset"`                       | Requis   | Discriminant de la définition : toolset. |
| `name`  | `string`                          | Requis   | Nom qui identifie le jeu d’outils.       |
| `tools` | `readonly HarnessTool<unknown>[]` | Requis   | Liste d’outils aplatie et figée.         |

## Signature

```ts
export interface HarnessToolset {
  readonly kind: "toolset";
  readonly name: string;
  readonly tools: readonly HarnessTool[];
}
```

## Contrats associés

- [HarnessTool](../harnesstool/)
