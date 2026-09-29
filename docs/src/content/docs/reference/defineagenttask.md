---
title: "defineAgentTask"
description: "defineAgentTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineAgentTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a workflow node that dispatches an agent through an existing caller-owned sandbox. request builds the brief and dispatch options from task dependencies. Cancellation and observed usage join the workflow accounting; the node does not close the shared sandbox.

[Complete example and detailed rules](../../guide/task-dependencies/).

## Parameters and properties

| Name                  | Type                                                                               | Presence | Meaning                                                                                                                                                                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<DispatchResult<T>>, "cache" \| "perform"> & AgentTaskOptions<T>` | Required | Task scheduling settings, existing sandbox and dispatch-request factory.                                                                                                                                                                                                    |
| `options.retry`       | `Retry \| undefined`                                                               | Optional | Explicit retry policy; repeated effects require care.                                                                                                                                                                                                                       |
| `options.key`         | `string`                                                                           | Required | Stable task key identifying the node within its workflow graph.                                                                                                                                                                                                             |
| `options.gate`        | `WorkflowGate \| undefined`                                                        | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                                                                    |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                            | Optional | Declared task dependencies whose values may be read.                                                                                                                                                                                                                        |
| `options.interaction` | `TaskInteraction \| undefined`                                                     | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                                                                   |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`             | Optional | Predicate evaluated before the first task attempt.                                                                                                                                                                                                                          |
| `options.timeoutMs`   | `number \| undefined`                                                              | Optional | Positive integer time limit in milliseconds for each task attempt, up to 2147483647; cancellation is cooperative through context.signal.                                                                                                                                    |
| `options.sandbox`     | `Sandbox`                                                                          | Required | Existing caller-owned sandbox reused by the task; the task does not close it.                                                                                                                                                                                               |
| `options.request`     | `(context: TaskContext) => DispatchOptions<T>`                                     | Required | Build dispatch options from task dependencies for the existing sandbox.                                                                                                                                                                                                     |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                   | Optional | After a quota pause, continue the captured conversation with a resume instruction (continue, default) or send the original request again (restart). Continuation is skipped when the agent cannot resume, the request supplies its own continuation or uses several passes. |

## Returns

`Task<DispatchResult<T>>`

## Signature

```ts
export declare function defineAgentTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform" | "cache"> &
    AgentTaskOptions<T>,
): Task<DispatchResult<T>>;
```

## Related contracts

- [AgentTaskOptions](../support-agenttaskoptions/)
- [DispatchResult](../dispatchresult/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
