---
title: "NoulQuestion"
description: "NoulQuestion — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { NoulQuestion } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                                              | Présence  | Rôle                                                                     |
| -------------- | ----------------------------------------------------------------- | --------- | ------------------------------------------------------------------------ |
| `type`         | `"noul"`                                                          | Requis    | Discriminant noul. Renvoyer une probabilité pour le résultat oui.        |
| `instructions` | `string`                                                          | Requis    | Instructions textuelles non vides pour cette question.                   |
| `criteria`     | `{ readonly true: string; readonly false: string; } \| undefined` | Optionnel | Descriptions facultatives et non vides des deux résultats true et false. |

## Signature

```ts
export interface NoulQuestion {
  readonly type: "noul";
  readonly instructions: string;
  readonly criteria?: {
    readonly true: string;
    readonly false: string;
  };
}
```
