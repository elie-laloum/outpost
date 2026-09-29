---
title: "FallbackCandidate"
description: "FallbackCandidate — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FallbackCandidate } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type                  | Présence  | Rôle                                                                                              |
| ------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `index` | `number`              | Requis    | Position du candidat dans FallbackAgent.agents, à partir de zéro.                                 |
| `name`  | `string`              | Requis    | Nom de l’adapter du candidat, par exemple claude, codex ou custom.                                |
| `model` | `string \| undefined` | Optionnel | Nom du modèle choisi sur le candidat ; absent lorsque le modèle par défaut de la CLI est utilisé. |

## Signature

```ts
export interface FallbackCandidate {
  /** Zero-based position in FallbackAgent.agents. */
  readonly index: number;
  readonly name: string;
  readonly model?: string;
}
```
