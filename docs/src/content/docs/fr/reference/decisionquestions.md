---
title: "DecisionQuestions"
description: "DecisionQuestions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { DecisionQuestions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Mapping en lecture seule de clés de questions non vides vers des déclarations choice, score ou noul.

[Exemple complet et règles détaillées](../../guide/decisions/).

## Signature

```ts
export type DecisionQuestions = Readonly<Record<string, DecisionQuestion>>;
```

## Contrats associés

- [DecisionQuestion](../decisionquestion/)
