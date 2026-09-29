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

| Nom       | Type                                                                                    | Présence | Rôle                                                                                                                                                                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                                                | Requis   | Nom non vide indiqué dans les événements compaction.                                                                                                                                                                                                                             |
| `compact` | `(input: HarnessContextInput) => HarnessContextResult \| Promise<HarnessContextResult>` | Requis   | Appelée avant chaque requête au modèle ; renvoie une liste de messages réécrite, ou rien pour garder l’historique. La liste doit commencer et finir par un message utilisateur et associer chaque appel d’outil à son résultat, sinon le tour échoue avec le code configuration. |

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
