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

## Purpose and behavior

Readonly mapping from nonempty question keys to choice, score or noul declarations.

[Complete example and detailed rules](../../guide/decisions/).

## Signature

```ts
export type DecisionQuestions = Readonly<Record<string, DecisionQuestion>>;
```

## Related contracts

- [DecisionQuestion](../decisionquestion/)
