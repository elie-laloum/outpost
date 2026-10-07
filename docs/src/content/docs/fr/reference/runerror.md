---
title: "RunError"
description: "RunError — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunError } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                  | Présence  | Rôle                                                               |
| --------- | --------------------- | --------- | ------------------------------------------------------------------ |
| `code`    | `string \| undefined` | Optionnel | Code d’erreur Outpost lorsque l’exécution émettrice en fournit un. |
| `message` | `string`              | Requis    | Message d’erreur observé après le masquage configuré.              |

## Signature

```ts
export interface RunError {
  readonly code?: string;
  readonly message: string;
}
```
