---
title: "isolatedTask"
description: "isolatedTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { isolatedTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define an agent workflow node whose request callback selects a repository, provider, agent and dispatch options for each attempt. It calls dispatch to allocate and close its own sandbox and returns DispatchResult. Use separate nodes to work on separate repositories; there is no shared Git transaction or automatic push.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name                  | Type                                                                                  | Presence | Meaning                                                                                                                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`             | `Omit<TaskOptions<DispatchResult<T>>, "cache" \| "perform"> & IsolatedTaskOptions<T>` | Required | Task scheduling settings and request factory selecting a separate repository and sandbox for each attempt.                                                                                                                                                   |
| `options.retry`       | `Retry \| undefined`                                                                  | Optional | Explicit retry policy; repeated effects require care.                                                                                                                                                                                                        |
| `options.key`         | `string`                                                                              | Required | Stable task key identifying the node within its workflow graph.                                                                                                                                                                                              |
| `options.gate`        | `WorkflowGate \| undefined`                                                           | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                                                     |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                               | Optional | Declared task dependencies whose values may be read.                                                                                                                                                                                                         |
| `options.interaction` | `TaskInteraction \| undefined`                                                        | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                                                    |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                | Optional | Predicate evaluated before the first task attempt.                                                                                                                                                                                                           |
| `options.timeoutMs`   | `number \| undefined`                                                                 | Optional | Positive integer time limit in milliseconds for each task attempt, up to 2147483647; cancellation is cooperative through context.signal.                                                                                                                     |
| `options.request`     | `(context: TaskContext) => IsolatedTaskRequest<T> \| Promise<IsolatedTaskRequest<T>>` | Required | Build repository, provider, agent and brief options for a separately allocated dispatch at each attempt.                                                                                                                                                     |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                      | Optional | After a quota pause, continue the captured conversation in the new dispatch (continue, default) or start a new one (restart). Automatically integrated workspaces then start from the interrupted branch; uncommitted changes stay in its retained worktree. |

## Returns

`Task<DispatchResult<T>>`

## Signature

```ts
export declare function isolatedTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform" | "cache"> &
    IsolatedTaskOptions<T>,
): Task<DispatchResult<T>>;
```

## Related contracts

- [DispatchResult](../dispatchresult/)
- [IsolatedTaskOptions](../support-isolatedtaskoptions/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
