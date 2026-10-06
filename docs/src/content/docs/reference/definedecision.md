---
title: "defineDecision"
description: "defineDecision — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineDecision } from "@elie-laloum/outpost";
```

## Purpose and behavior

Validate, snapshot and freeze named choice, score and noul questions. No provider request occurs; literal keys and choices determine the inferred answer types.

[Complete example and detailed rules](../../guide/decisions/).

## Parameters and properties

| Name                | Type                 | Presence | Meaning                                                                             |
| ------------------- | -------------------- | -------- | ----------------------------------------------------------------------------------- |
| `options`           | `DecisionOptions<Q>` | Required | Questions to validate, snapshot and freeze without executing a request.             |
| `options.questions` | `Q`                  | Required | Nonempty named questions whose keys and choice literals determine the answer types. |

## Returns

`Decision<Q>`

## Signature

```ts
export declare function defineDecision<const Q extends DecisionQuestions>(
  options: DecisionOptions<Q>,
): Decision<Q>;
```

## Related contracts

- [Decision](../decision/)
- [DecisionOptions](../decisionoptions/)
- [DecisionQuestions](../decisionquestions/)
