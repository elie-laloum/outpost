---
title: "RunPass"
description: "RunPass — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunPass } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type     | Présence | Rôle                                                                                                       |
| ------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `pass`  | `number` | Requis   | Numéro de passage du dispatch dans son contexte d’observation.                                             |
| `usage` | `Usage`  | Requis   | Derniers tokens du passage, additionnant les deltas et remplaçant les compteurs cumulés ou récapitulatifs. |

## Signature

```ts
export interface RunPass {
  readonly pass: number;
  readonly usage: Usage;
}
```

## Contrats associés

- [Usage](../usage/)
