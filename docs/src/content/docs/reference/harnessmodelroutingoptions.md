---
title: "HarnessModelRoutingOptions"
description: "HarnessModelRoutingOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessModelRoutingOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                                                                                               | Presence | Meaning                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `provider`      | `DecisionProvider`                                                                                                 | Required | Independent decision provider used once per harness step after compaction.                                                                                    |
| `model`         | `string`                                                                                                           | Required | Named router model, independently of the conversational candidate models.                                                                                     |
| `decision`      | `Decision<Q>`                                                                                                      | Required | Frozen question declaration containing the selected choice question.                                                                                          |
| `question`      | `Key`                                                                                                              | Required | Explicit choice-question key whose criteria exactly match the candidate model keys.                                                                           |
| `models`        | `Readonly<Record<\`${Extract<keyof Extract<Q[Key], ChoiceQuestion>["criteria"], string \| number>}\`, ModelSpec>>` | Required | One candidate per declared choice; all use the harness model provider and have independent model settings.                                                    |
| `minConfidence` | `number \| undefined`                                                                                              | Optional | Confidence threshold in [0,1]; lower confidence selects fallback. Defaults to 0.85 when declared.                                                             |
| `fallback`      | `\`${Extract<keyof Extract<Q[Key], ChoiceQuestion>["criteria"], string \| number>}\``                              | Required | Declared candidate key used for low confidence or permitted router failures.                                                                                  |
| `onError`       | `"fallback" \| "fail" \| undefined`                                                                                | Optional | Defaults to fallback for timeout or classified unavailability only; fail propagates those faults. Other faults always propagate.                              |
| `state`         | `((context: HarnessModelRoutingContext) => DecisionState \| Promise<DecisionState>) \| undefined`                  | Optional | Optional synchronous/asynchronous state builder; default state contains instructions, visible history, tools, step and active model without opaque reasoning. |

## Signature

```ts
export interface HarnessModelRoutingOptions<
  Q extends DecisionQuestions = DecisionQuestions,
  Key extends RoutingQuestion<Q> = RoutingQuestion<Q>,
> {
  readonly provider: DecisionProvider;
  readonly model: string;
  readonly decision: Decision<Q>;
  readonly question: Key;
  readonly models: Readonly<Record<RoutingChoices<Q, Key>, ModelSpec>>;
  readonly minConfidence?: number;
  readonly fallback: RoutingChoices<Q, Key>;
  readonly onError?: "fallback" | "fail";
  readonly state?: (
    context: HarnessModelRoutingContext,
  ) => DecisionState | Promise<DecisionState>;
}
```

## Related contracts

- [Decision](../decision/)
- [DecisionProvider](../decisionprovider/)
- [DecisionQuestions](../decisionquestions/)
- [DecisionState](../decisionstate/)
- [HarnessModelRoutingContext](../harnessmodelroutingcontext/)
- [ModelSpec](../modelspec/)
- [RoutingChoices](../routingchoices/)
- [RoutingQuestion](../routingquestion/)
