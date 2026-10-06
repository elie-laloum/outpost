---
title: "ChoiceQuestion"
description: "ChoiceQuestion — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ChoiceQuestion } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                               | Présence | Rôle                                                                                                 |
| -------------- | ---------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `type`         | `"choice"`                         | Requis   | Discriminant choice. Choisir une des 2 à 255 options nommées.                                        |
| `instructions` | `string`                           | Requis   | Instructions textuelles non vides pour cette question.                                               |
| `criteria`     | `Readonly<Record<string, string>>` | Requis   | Options nommées avec descriptions non vides ; les clés deviennent les valeurs littérales autorisées. |

## Signature

```ts
export interface ChoiceQuestion {
  readonly type: "choice";
  readonly instructions: string;
  readonly criteria: Readonly<Record<string, string>>;
}
```
