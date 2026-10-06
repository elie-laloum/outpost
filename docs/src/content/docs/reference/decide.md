---
title: "decide"
description: "decide — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { decide } from "@elie-laloum/outpost";
```

## Purpose and behavior

Execute one decision-provider request against lossless JSON state, validate all answers and return normalized usage and native metadata. Distribution totals and weighted scores allow accumulated four-decimal rounding without changing native values. Reported truncation fails unless explicitly allowed.

[Complete example and detailed rules](../../guide/decisions/).

## Parameters and properties

| Name                     | Type                          | Presence | Meaning                                                                                      |
| ------------------------ | ----------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `options`                | `DecideOptions<Q>`            | Required | Provider, named model, declaration and lossless JSON state for one immediate evaluation.     |
| `options.provider`       | `DecisionProvider`            | Required | Decision provider that performs this evaluation.                                             |
| `options.model`          | `string`                      | Required | Nonempty decision model name, without generation or reasoning settings.                      |
| `options.decision`       | `Decision<Q>`                 | Required | Frozen typed question declaration created with defineDecision.                               |
| `options.state`          | `DecisionState`               | Required | Text, object or array validated as lossless JSON before the request.                         |
| `options.signal`         | `AbortSignal \| undefined`    | Optional | Optional caller cancellation signal forwarded to the decision provider.                      |
| `options.observation`    | `ObservationHub \| undefined` | Optional | Optional scoped observation hub; detailed state and answers require verbose mode.            |
| `options.allowTruncated` | `boolean \| undefined`        | Optional | False by default; true accepts a reported truncation while retaining its flag in the result. |

## Returns

`Promise<DecisionResult<Q>>`

## Signature

```ts
export declare function decide<const Q extends DecisionQuestions>(
  options: DecideOptions<Q>,
): Promise<DecisionResult<Q>>;
```

## Related contracts

- [DecideOptions](../decideoptions/)
- [DecisionQuestions](../decisionquestions/)
- [DecisionResult](../decisionresult/)
