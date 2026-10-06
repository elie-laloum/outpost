---
title: "HarnessModelRouting"
description: "HarnessModelRouting — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessModelRouting } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                                                                              | Presence | Meaning                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`          | `"model-routing"`                                                                                 | Required | Validated routing declaration discriminator model-routing.                                                                                                    |
| `provider`      | `DecisionProvider`                                                                                | Required | Independent decision provider used once per harness step after compaction.                                                                                    |
| `model`         | `string`                                                                                          | Required | Named router model, independently of the conversational candidate models.                                                                                     |
| `decision`      | `Decision<Readonly<Record<string, DecisionQuestion>>>`                                            | Required | Frozen question declaration containing the selected choice question.                                                                                          |
| `question`      | `string`                                                                                          | Required | Explicit choice-question key whose criteria exactly match the candidate model keys.                                                                           |
| `models`        | `Readonly<Record<string, AgentModel>>`                                                            | Required | One candidate per declared choice; all use the harness model provider and have independent model settings.                                                    |
| `minConfidence` | `number`                                                                                          | Required | Confidence threshold in [0,1]; lower confidence selects fallback. Defaults to 0.85 when declared.                                                             |
| `fallback`      | `string`                                                                                          | Required | Declared candidate key used for low confidence or permitted router failures.                                                                                  |
| `onError`       | `"fallback" \| "fail"`                                                                            | Required | Defaults to fallback for timeout or classified unavailability only; fail propagates those faults. Other faults always propagate.                              |
| `state`         | `((context: HarnessModelRoutingContext) => DecisionState \| Promise<DecisionState>) \| undefined` | Optional | Optional synchronous/asynchronous state builder; default state contains instructions, visible history, tools, step and active model without opaque reasoning. |

## Signature

```ts
export interface HarnessModelRouting {
  readonly kind: "model-routing";
  readonly provider: DecisionProvider;
  readonly model: string;
  readonly decision: Decision;
  readonly question: string;
  readonly models: Readonly<Record<string, AgentModel>>;
  readonly minConfidence: number;
  readonly fallback: string;
  readonly onError: "fallback" | "fail";
  readonly state?: (
    context: HarnessModelRoutingContext,
  ) => DecisionState | Promise<DecisionState>;
}
```

## Related contracts

- [AgentModel](../agentmodel/)
- [Decision](../decision/)
- [DecisionProvider](../decisionprovider/)
- [DecisionState](../decisionstate/)
- [HarnessModelRoutingContext](../harnessmodelroutingcontext/)
