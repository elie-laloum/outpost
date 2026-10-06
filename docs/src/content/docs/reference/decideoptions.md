---
title: "DecideOptions"
description: "DecideOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecideOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                          | Presence | Meaning                                                                                      |
| ---------------- | ----------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `provider`       | `DecisionProvider`            | Required | Decision provider that performs this evaluation.                                             |
| `model`          | `string`                      | Required | Nonempty decision model name, without generation or reasoning settings.                      |
| `decision`       | `Decision<Q>`                 | Required | Frozen typed question declaration created with defineDecision.                               |
| `state`          | `DecisionState`               | Required | Text, object or array validated as lossless JSON before the request.                         |
| `signal`         | `AbortSignal \| undefined`    | Optional | Optional caller cancellation signal forwarded to the decision provider.                      |
| `observation`    | `ObservationHub \| undefined` | Optional | Optional scoped observation hub; detailed state and answers require verbose mode.            |
| `allowTruncated` | `boolean \| undefined`        | Optional | False by default; true accepts a reported truncation while retaining its flag in the result. |

## Signature

```ts
export interface DecideOptions<
  Q extends DecisionQuestions = DecisionQuestions,
> {
  readonly provider: DecisionProvider;
  readonly model: string;
  readonly decision: Decision<Q>;
  readonly state: DecisionState;
  readonly signal?: AbortSignal;
  readonly observation?: ObservationHub;
  readonly allowTruncated?: boolean;
}
```

## Related contracts

- [Decision](../decision/)
- [DecisionProvider](../decisionprovider/)
- [DecisionQuestions](../decisionquestions/)
- [DecisionState](../decisionstate/)
- [ObservationHub](../observationhub/)
