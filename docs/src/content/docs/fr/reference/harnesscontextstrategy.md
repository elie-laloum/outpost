---
title: "HarnessContextStrategy"
description: "HarnessContextStrategy — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessContextStrategy } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                            | Présence | Rôle                                              |
| --------- | --------------------------------------------------------------- | -------- | ------------------------------------------------- |
| `kind`    | `"context"`                                                     | Requis   | Discriminant de la définition : context.          |
| `name`    | `string`                                                        | Requis   | Nom indiqué dans les événements compaction.       |
| `compact` | `(input: HarnessContextInput) => Promise<HarnessContextResult>` | Requis   | Exécute la stratégie avant une requête au modèle. |

## Signature

```ts
export interface HarnessContextStrategy {
  readonly kind: "context";
  readonly name: string;
  compact(input: HarnessContextInput): Promise<HarnessContextResult>;
}
```

## Contrats associés

- [HarnessContextInput](../harnesscontextinput/)
- [HarnessContextResult](../harnesscontextresult/)
