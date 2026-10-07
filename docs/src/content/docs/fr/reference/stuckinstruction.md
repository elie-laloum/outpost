---
title: "StuckInstruction"
description: "StuckInstruction — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StuckInstruction } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                  | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                      |
| ------------------ | --------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `instruction`      | `string`              | Requis    | Texte littéral de steering non vide envoyé à la détection d’une répétition, sans expansion du brief. Les événements des sous-agents intégrés ciblent ce sous-agent ; les consignes CLI utilisent l’entrée directe si disponible ou arrêtent puis reprennent dès qu’une conversation est connue. Les consignes non remises échouent avec le code steering. |
| `maxInterventions` | `number \| undefined` | Optionnel | Entier positif, 1 par défaut : total des consignes autorisées entre tours repris et réparations de réponse d’une exécution. Les épisodes suivants arrêtent avec le code stuck. Les passes froides distinctes, candidats de repli et dispatchs suivants ont une nouvelle limite.                                                                           |

## Signature

```ts
export interface StuckInstruction {
  readonly instruction: string;
  readonly maxInterventions?: number;
}
```
