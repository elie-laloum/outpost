---
title: "defineHarnessToolset"
description: "defineHarnessToolset — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le contrat peut changer avant publication.
:::

## Import

```ts
import { defineHarnessToolset } from "@elie-laloum/outpost";
```

## Rôle et comportement

Regroupe des outils et des jeux imbriqués sous un nom pour les réutiliser entre harness. Aplatit les jeux imbriqués et refuse les noms d’outils en double.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom             | Type                                                  | Présence | Rôle                                                                  |
| --------------- | ----------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| `options`       | `HarnessToolsetOptions`                               | Requis   | Nom du jeu d’outils et outils ou jeux imbriqués qu’il regroupe.       |
| `options.name`  | `string`                                              | Requis   | Nom non vide qui identifie le jeu d’outils.                           |
| `options.tools` | `readonly (HarnessTool<unknown> \| HarnessToolset)[]` | Requis   | Outils et jeux imbriqués à regrouper ; les noms doivent être uniques. |

## Retour

`HarnessToolset`

## Signature

```ts
export declare function defineHarnessToolset(
  options: HarnessToolsetOptions,
): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
- [HarnessToolsetOptions](../harnesstoolsetoptions/)
