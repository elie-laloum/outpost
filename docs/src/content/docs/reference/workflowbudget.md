---
title: "WorkflowBudget"
description: "WorkflowBudget — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowBudget } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                          | Presence | Meaning                                                                                            |
| ---------- | ----------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `attempts` | `number \| undefined`         | Optional | Maximum cumulative task attempts that the workflow may admit.                                      |
| `usage`    | `Partial<Usage> \| undefined` | Optional | Per-token-counter admission thresholds; observed usage may overshoot while admitted work finishes. |

## Signature

```ts
export interface WorkflowBudget {
  readonly attempts?: number;
  readonly usage?: Partial<Usage>;
}
```

## Related contracts

- [Usage](../usage/)
