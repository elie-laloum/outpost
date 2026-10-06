---
title: "DecisionResult"
description: "DecisionResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecisionResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                        | Presence | Meaning                                                                                                       |
| ----------- | --------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `provider`  | `string`                    | Required | Name of the decision provider that executed the request.                                                      |
| `model`     | `string`                    | Required | Actual nonempty model name reported by the provider response.                                                 |
| `answers`   | `DecisionAnswers<Q>`        | Required | Validated answers with keys and choice literals inferred from the decision questions.                         |
| `usage`     | `Usage`                     | Required | Normalized usage counted once by the enclosing task or routed harness; absent receipts set complete to false. |
| `truncated` | `boolean \| undefined`      | Optional | Reported input truncation; absence does not establish that the complete input was evaluated.                  |
| `metadata`  | `WorkflowJson \| undefined` | Optional | Optional lossless JSON extensions; the System One adapter retains the full native response here.              |

## Signature

```ts
export interface DecisionResult<
  Q extends DecisionQuestions = DecisionQuestions,
> {
  readonly provider: string;
  readonly model: string;
  readonly answers: DecisionAnswers<Q>;
  readonly usage: Usage;
  readonly truncated?: boolean;
  readonly metadata?: WorkflowJson;
}
```

## Related contracts

- [DecisionAnswers](../decisionanswers/)
- [DecisionQuestions](../decisionquestions/)
- [Usage](../usage/)
- [WorkflowJson](../workflowjson/)
