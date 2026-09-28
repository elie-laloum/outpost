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

| Nom                  | Type                  | Présence  | Rôle                                                                                      |
| -------------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `triggerCharacters`  | `number \| undefined` | Optionnel | Taille de l’historique sérialisé qui déclenche un résumé ; 400 000 caractères par défaut. |
| `keepRecentMessages` | `number \| undefined` | Optionnel | Nombre de messages récents conservés après le résumé ; 6 par défaut.                      |

## Signature

```ts
export interface SummarizeHistoryOptions {
  readonly triggerCharacters?: number;
  readonly keepRecentMessages?: number;
}
```
