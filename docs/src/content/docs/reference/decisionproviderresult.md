---
title: "DecisionProviderResult"
description: "DecisionProviderResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecisionProviderResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                | Presence | Meaning                                                                                                    |
| ----------- | ----------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `model`     | `string`                            | Required | Actual nonempty model name reported by the provider response.                                              |
| `answers`   | `Readonly<Record<string, unknown>>` | Required | Untrusted native answer objects, validated by decide against every declared question.                      |
| `usage`     | `Usage \| undefined`                | Optional | Optional normalized usage receipt; missing usage becomes incomplete rather than proof of zero consumption. |
| `truncated` | `boolean \| undefined`              | Optional | Reported input truncation; absence does not establish that the complete input was evaluated.               |
| `metadata`  | `WorkflowJson \| undefined`         | Optional | Optional lossless JSON extensions; the System One adapter retains the full native response here.           |

## Signature

```ts
export interface DecisionProviderResult {
  readonly model: string;
  readonly answers: Readonly<Record<string, unknown>>;
  readonly usage?: Usage;
  readonly truncated?: boolean;
  readonly metadata?: WorkflowJson;
}
```

## Related contracts

- [Usage](../usage/)
- [WorkflowJson](../workflowjson/)
