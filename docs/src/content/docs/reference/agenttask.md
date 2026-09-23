---
title: "agentTask"
description: "agentTask — Outpost API"
sidebar:
  order: 10
---

Public contract for **agentTask**. See the [workflows guide](../../workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import { agentTask } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function agentTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform"> &
    AgentTaskOptions<T>,
): Task<DispatchResult<T>>;
```

## Related contracts

- [AgentTaskOptions](../support-agenttaskoptions/)
- [DispatchResult](../dispatchresult/)
- [Task](../task/)
- [TaskOptions](../taskoptions/)
