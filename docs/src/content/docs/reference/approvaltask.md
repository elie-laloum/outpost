---
title: "approvalTask"
description: "approvalTask — Outpost API"
sidebar:
  order: 10
---

Public contract for **approvalTask**. See the [approval and pause gates guide](../../workflows/approvals/) for behavior, defaults and examples.

## Import

```ts
import { approvalTask } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function approvalTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord>;
```

## Related contracts

- [Task](../task/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowGateOptions](../workflowgateoptions/)
