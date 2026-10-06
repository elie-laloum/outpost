---
title: "defineHarnessModelRouting"
description: "defineHarnessModelRouting — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessModelRouting } from "@elie-laloum/outpost";
```

## Purpose and behavior

Validate and freeze a choice-to-model routing declaration. Exact candidate keys and a declared fallback are required; the built-in harness validates candidates against its model provider before allocation.

[Complete example and detailed rules](../../guide/decisions/).

## Parameters and properties

| Name                    | Type                                                                                                               | Presence | Meaning                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`               | `HarnessModelRoutingOptions<Q, Key>`                                                                               | Required | Choice question, exact candidate mapping, fallback policy and optional state builder.                                                                         |
| `options.provider`      | `DecisionProvider`                                                                                                 | Required | Independent decision provider used once per harness step after compaction.                                                                                    |
| `options.model`         | `string`                                                                                                           | Required | Named router model, independently of the conversational candidate models.                                                                                     |
| `options.decision`      | `Decision<Q>`                                                                                                      | Required | Frozen question declaration containing the selected choice question.                                                                                          |
| `options.question`      | `Key`                                                                                                              | Required | Explicit choice-question key whose criteria exactly match the candidate model keys.                                                                           |
| `options.models`        | `Readonly<Record<\`${Extract<keyof Extract<Q[Key], ChoiceQuestion>["criteria"], string \| number>}\`, ModelSpec>>` | Required | One candidate per declared choice; all use the harness model provider and have independent model settings.                                                    |
| `options.minConfidence` | `number \| undefined`                                                                                              | Optional | Confidence threshold in [0,1]; lower confidence selects fallback. Defaults to 0.85 when declared.                                                             |
| `options.fallback`      | `\`${Extract<keyof Extract<Q[Key], ChoiceQuestion>["criteria"], string \| number>}\``                              | Required | Declared candidate key used for low confidence or permitted router failures.                                                                                  |
| `options.onError`       | `"fallback" \| "fail" \| undefined`                                                                                | Optional | Defaults to fallback for timeout or classified unavailability only; fail propagates those faults. Other faults always propagate.                              |
| `options.state`         | `((context: HarnessModelRoutingContext) => DecisionState \| Promise<DecisionState>) \| undefined`                  | Optional | Optional synchronous/asynchronous state builder; default state contains instructions, visible history, tools, step and active model without opaque reasoning. |

## Returns

`HarnessModelRouting`

## Signature

```ts
export declare function defineHarnessModelRouting<
  const Q extends DecisionQuestions,
  const Key extends RoutingQuestion<Q>,
>(options: HarnessModelRoutingOptions<Q, Key>): HarnessModelRouting;
```

## Related contracts

- [DecisionQuestions](../decisionquestions/)
- [HarnessModelRouting](../harnessmodelrouting/)
- [HarnessModelRoutingOptions](../harnessmodelroutingoptions/)
- [RoutingQuestion](../routingquestion/)
