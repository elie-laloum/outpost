---
title: "DecisionRequest"
description: "DecisionRequest — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecisionRequest } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                         | Presence | Meaning                                                                 |
| ----------- | -------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `model`     | `string`                                     | Required | Nonempty decision model name, without generation or reasoning settings. |
| `questions` | `Readonly<Record<string, DecisionQuestion>>` | Required | Validated immutable named questions sent in the provider request.       |
| `state`     | `DecisionState`                              | Required | Text, object or array validated as lossless JSON before the request.    |
| `signal`    | `AbortSignal \| undefined`                   | Optional | Optional caller cancellation signal forwarded to the decision provider. |

## Signature

```ts
export interface DecisionRequest {
  readonly model: string;
  readonly questions: DecisionQuestions;
  readonly state: DecisionState;
  readonly signal?: AbortSignal;
}
```

## Related contracts

- [DecisionQuestions](../decisionquestions/)
- [DecisionState](../decisionstate/)
