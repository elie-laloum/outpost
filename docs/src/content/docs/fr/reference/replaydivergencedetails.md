---
title: "ReplayDivergenceDetails"
description: "ReplayDivergenceDetails — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReplayDivergenceDetails } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                   | Présence  | Rôle                                                                                                       |
| ---------- | ---------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| `kind`     | `ReplayDivergenceKind` | Requis    | Catégorie de divergence : prompt, baseline, tree, exhausted ou unrecorded.                                 |
| `turn`     | `number`               | Requis    | Index, à partir de 1, du tour enregistré en cours de rejeu.                                                |
| `expected` | `string \| undefined`  | Optionnel | Valeur enregistrée : texte du prompt, identifiant d’arbre ou raison de l’absence des commits du workspace. |
| `actual`   | `string \| undefined`  | Optionnel | Valeur observée pendant le rejeu : prompt rendu, identifiant d’arbre ou erreur de git apply.               |
| `commit`   | `string \| undefined`  | Optionnel | Commit enregistré dont le patch ou l’arbre a divergé, pour les divergences tree.                           |

## Signature

```ts
export interface ReplayDivergenceDetails {
  readonly kind: ReplayDivergenceKind;
  readonly turn: number;
  readonly expected?: string;
  readonly actual?: string;
  readonly commit?: string;
}
```

## Contrats associés

- [ReplayDivergenceKind](../replaydivergencekind/)
