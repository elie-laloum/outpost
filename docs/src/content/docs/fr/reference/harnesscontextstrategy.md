---
title: "HarnessContextStrategy"
description: "HarnessContextStrategy — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Skills et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

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
