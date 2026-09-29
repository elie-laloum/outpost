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

| Nom     | Type                  | Présence  | Rôle                                                                                                           |
| ------- | --------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| `index` | `number`              | Requis    | Position du candidat dans FallbackAgent.agents, à partir de zéro.                                              |
| `name`  | `string`              | Requis    | Nom de l’adapter du candidat, par exemple claude, codex, custom ou replay.                                     |
| `model` | `string \| undefined` | Optionnel | Nom du modèle choisi sur le candidat ; absent quand une CLI garde son défaut natif, et pour un agent de rejeu. |

## Signature

```ts
export interface FallbackCandidate {
  /** Zero-based position in FallbackAgent.agents. */
  readonly index: number;
  readonly name: string;
  readonly model?: string;
}
```
