---
title: "HarnessContextStrategyOptions"
description: "HarnessContextStrategyOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessContextStrategyOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                                                    | Présence | Rôle                                                                                                                                                                                         |
| --------- | --------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                                                | Requis   | Nom non vide indiqué dans les événements compaction.                                                                                                                                         |
| `compact` | `(input: HarnessContextInput) => HarnessContextResult \| Promise<HarnessContextResult>` | Requis   | Renvoie une liste de messages réécrite, ou rien pour garder l’historique. La liste doit commencer et finir par un message utilisateur et garder chaque appel d’outil associé à son résultat. |

## Signature

```ts
export interface HarnessContextStrategyOptions {
  readonly name: string;
  compact(
    input: HarnessContextInput,
  ): HarnessContextResult | Promise<HarnessContextResult>;
}
```

## Contrats associés

- [HarnessContextInput](../harnesscontextinput/)
- [HarnessContextResult](../harnesscontextresult/)
