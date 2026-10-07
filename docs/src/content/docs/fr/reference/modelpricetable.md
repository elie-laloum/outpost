---
title: "ModelPriceTable"
description: "ModelPriceTable — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelPriceTable } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                   | Présence | Rôle                                                                                                                                          |
| ---------- | -------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `currency` | `"EUR" \| "USD"`                       | Requis   | Devise commune aux tarifs : EUR ou USD. Aucune conversion implicite.                                                                          |
| `models`   | `Readonly<Record<string, ModelPrice>>` | Requis   | Noms exacts de modèles Outpost associés aux tarifs par million de tokens ; utilisez des alias explicites pour distinguer services ou paliers. |

## Signature

```ts
export interface ModelPriceTable {
  readonly currency: "EUR" | "USD";
  readonly models: Readonly<Record<string, ModelPrice>>;
}
```

## Contrats associés

- [ModelPrice](../modelprice/)
