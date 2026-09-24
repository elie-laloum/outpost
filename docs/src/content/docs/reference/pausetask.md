---
title: "pauseTask"
description: "pauseTask — Outpost API"
sidebar:
  order: 10
---

Public contract for **pauseTask**. See the [approval and pause gates guide](../../workflows/approvals/) for behavior, defaults and examples.

## Import

```ts
import { pauseTask } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function pauseTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord>;
```

## Related contracts

- [Task](../task/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowGateOptions](../workflowgateoptions/)
