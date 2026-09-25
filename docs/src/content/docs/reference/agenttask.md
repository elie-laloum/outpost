---
title: "agentTask"
description: "agentTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { agentTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a workflow node that dispatches an agent through an existing caller-owned sandbox. request builds the brief and dispatch options from task dependencies. Cancellation and observed usage join the workflow accounting; the node does not close the shared sandbox.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name                | Type                                                                    | Presence | Meaning                                                                                                  |
| ------------------- | ----------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `options`           | `Omit<TaskOptions<DispatchResult<T>>, "perform"> & AgentTaskOptions<T>` | Required | Task scheduling settings, existing sandbox and dispatch-request factory.                                 |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                 | Optional | Declared task dependencies whose values may be read.                                                     |
| `options.key`       | `string`                                                                | Required | Stable task key identifying the node within its workflow graph.                                          |
| `options.gate`      | `WorkflowGate \| undefined`                                             | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision. |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optional | Predicate evaluated before the first task attempt.                                                       |
| `options.retry`     | `Retry \| undefined`                                                    | Optional | Explicit retry policy; repeated effects require care.                                                    |
| `options.timeoutMs` | `number \| undefined`                                                   | Optional | Time limit in milliseconds for each task attempt; cancellation is cooperative through context.signal.    |
| `options.sandbox`   | `Sandbox`                                                               | Required | Existing caller-owned sandbox reused by the task; the task does not close it.                            |
| `options.request`   | `(context: TaskContext) => DispatchOptions<T>`                          | Required | Build dispatch options from task dependencies for the existing sandbox.                                  |

## Returns

`Task<DispatchResult<T>>`

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
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
