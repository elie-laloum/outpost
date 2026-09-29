---
title: "SummarizeHistoryOptions"
description: "SummarizeHistoryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SummarizeHistoryOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                  | Type                  | Présence  | Rôle                                                                                                                                 |
| -------------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `triggerCharacters`  | `number \| undefined` | Optionnel | Longueur de l’historique sérialisé en JSON au-delà de laquelle un résumé est produit, 400000 caractères par défaut.                  |
| `keepRecentMessages` | `number \| undefined` | Optionnel | Nombre minimal de messages récents conservés après le résumé, 6 par défaut ; la coupure recule jusqu’au message assistant précédent. |

## Signature

```ts
export interface SummarizeHistoryOptions {
  readonly triggerCharacters?: number;
  readonly keepRecentMessages?: number;
}
```
