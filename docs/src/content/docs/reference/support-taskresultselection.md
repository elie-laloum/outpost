---
title: "TaskResultSelection"
description: "TaskResultSelection — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name     | Type                                            | Presence | Meaning                                                                                                                                                                                       |
| -------- | ----------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `select` | `(result: Result) => Output \| Promise<Output>` | Required | Project the completed dispatch result into the task output after usage accounting. Return lossless JSON for checkpointed workflows. This does not enable caching or change sandbox ownership. |

## Signature

```ts
export interface TaskResultSelection<Result, Output> {
  select(result: Result): Output | Promise<Output>;
}
```
