---
title: "DecisionOptions"
description: "DecisionOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecisionOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type | Présence | Rôle                                                                                            |
| ----------- | ---- | -------- | ----------------------------------------------------------------------------------------------- |
| `questions` | `Q`  | Requis   | Questions nommées non vides dont les clés et choix littéraux déterminent les types de réponses. |

## Signature

```ts
export interface DecisionOptions<
  Q extends DecisionQuestions = DecisionQuestions,
> {
  readonly questions: Q;
}
```

## Contrats associés

- [DecisionQuestions](../decisionquestions/)
