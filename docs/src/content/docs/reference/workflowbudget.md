---
title: "WorkflowBudget"
description: "WorkflowBudget — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowBudget**. See the [workflows guide](../../guide/workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowBudget } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name       | Type                          | Presence | Meaning                                                             |
| ---------- | ----------------------------- | -------- | ------------------------------------------------------------------- |
| `attempts` | `number \| undefined`         | Optional | Attempt count or admission limit, according to the owning contract. |
| `usage`    | `Partial<Usage> \| undefined` | Optional | Reported usage counters; not a currency estimate.                   |

## Signature

```ts
export interface WorkflowBudget {
  readonly attempts?: number;
  readonly usage?: Partial<Usage>;
}
```

## Related contracts

- [Usage](../usage/)
