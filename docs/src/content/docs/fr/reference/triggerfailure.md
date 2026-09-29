---
title: "TriggerFailure"
description: "TriggerFailure — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerFailure } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                               | Présence  | Rôle                                                                      |
| ---------- | ---------------------------------- | --------- | ------------------------------------------------------------------------- |
| `path`     | `string`                           | Requis    | Chemin de route de la requête en échec.                                   |
| `stage`    | `"verify" \| "route" \| "enqueue"` | Requis    | Étape en échec : verify (401), route (500) ou enqueue (503).              |
| `delivery` | `string \| undefined`              | Optionnel | Identifiant de livraison, connu seulement après une vérification réussie. |

## Signature

```ts
export interface TriggerFailure {
  readonly path: string;
  readonly stage: "verify" | "route" | "enqueue";
  readonly delivery?: string;
}
```
