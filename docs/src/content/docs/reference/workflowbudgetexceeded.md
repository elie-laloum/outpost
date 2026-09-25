---
title: "WorkflowBudgetExceeded"
description: "WorkflowBudgetExceeded — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowBudgetExceeded**. See the [workflows guide](../../guide/workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import { WorkflowBudgetExceeded } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name        | Type                        | Presence | Meaning                                                                 |
| ----------- | --------------------------- | -------- | ----------------------------------------------------------------------- |
| `dimension` | `"attempts" \| keyof Usage` | Required | See the linked contract and this family's rules for its interpretation. |
| `limit`     | `number`                    | Required | See the linked contract and this family's rules for its interpretation. |
| `observed`  | `number`                    | Required | See the linked contract and this family's rules for its interpretation. |
| `name`      | `string`                    | Required | See the linked contract and this family's rules for its interpretation. |
| `message`   | `string`                    | Required | See the linked contract and this family's rules for its interpretation. |
| `stack`     | `string \| undefined`       | Optional | See the linked contract and this family's rules for its interpretation. |
| `cause`     | `unknown`                   | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export declare class WorkflowBudgetExceeded extends Error {
  readonly dimension: "attempts" | keyof Usage;
  readonly limit: number;
  readonly observed: number;
  constructor(
    dimension: "attempts" | keyof Usage,
    limit: number,
    observed: number,
  );
}
```

## Related contracts

- [Usage](../usage/)
