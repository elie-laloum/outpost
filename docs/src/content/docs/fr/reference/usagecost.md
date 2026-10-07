---
title: "UsageCost"
description: "UsageCost — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { UsageCost } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type             | Présence | Rôle                                                                                                            |
| ---------- | ---------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `currency` | `"EUR" \| "USD"` | Requis   | Devise de la table utilisée pour estimer cet usage.                                                             |
| `amount`   | `number`         | Requis   | Montant estimé dans l’unité principale de la devise ; borne inférieure lorsque complete vaut false.             |
| `complete` | `boolean`        | Requis   | True uniquement si chaque token rapporté est associé à un modèle tarifé et si tous les compteurs sont complets. |

## Signature

```ts
export interface UsageCost {
  readonly currency: "EUR" | "USD";
  readonly amount: number;
  readonly complete: boolean;
}
```
