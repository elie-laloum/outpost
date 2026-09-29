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

| Name       | Type                                            | Presence | Meaning                                                                                                                                    |
| ---------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `attempts` | `number \| undefined`                           | Optional | Maximum task attempts admitted over the run and its checkpoint resumes. Reaching it cancels the tasks not yet started.                     |
| `usage`    | `Partial<Omit<Usage, "complete">> \| undefined` | Optional | Token limits per counter (input, cached, cacheCreated, output). Reaching one cancels running tasks too; usage reported late can exceed it. |

## Signature

```ts
export interface WorkflowBudget {
  readonly attempts?: number;
  readonly usage?: Partial<Omit<Usage, "complete">>;
}
```

## Related contracts

- [Usage](../usage/)
