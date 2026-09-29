---
title: "ArtifactTaskOptions"
description: "ArtifactTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ArtifactTaskOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                    | Presence | Meaning                                                                                                                                                                                                                      |
| ------------- | ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retry`       | `Retry \| undefined`                                                    | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                 |
| `key`         | `string`                                                                | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                    |
| `cache`       | `TaskCacheOptions \| undefined`                                         | Optional | Result cache: a hit restores the stored lossless JSON value with no attempt, usage or side effects. On a miss, a result that is not lossless JSON fails the task. Rejected on gates, interactions and dispatch-result tasks. |
| `gate`        | `WorkflowGate \| undefined`                                             | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                     |
| `after`       | `readonly Task<unknown>[] \| undefined`                                 | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                   |
| `interaction` | `TaskInteraction \| undefined`                                          | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                    |
| `condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                        |
| `timeoutMs`   | `number \| undefined`                                                   | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                  |
| `store`       | `ArtifactStore`                                                         | Required | Store that receives the published artifact.                                                                                                                                                                                  |
| `contract`    | `ArtifactContract<T>`                                                   | Required | Contract that validates and encodes the produced value.                                                                                                                                                                      |
| `produce`     | `(context: TaskContext) => T \| Promise<T>`                             | Required | Compute the value to publish from the task context, for example from context.value() of a dependency.                                                                                                                        |
| `parents`     | `((context: TaskContext) => readonly ArtifactReference[]) \| undefined` | Optional | Return the parent references to record, usually context.value() of artifact tasks listed in after. Runs before produce().                                                                                                    |

## Signature

```ts
export type ArtifactTaskOptions<T> = Omit<
  TaskOptions<ArtifactReference>,
  "perform"
> & {
  readonly store: ArtifactStore;
  readonly contract: ArtifactContract<T>;
  readonly produce: (context: TaskContext) => T | Promise<T>;
  readonly parents?: (context: TaskContext) => readonly ArtifactReference[];
};
```

## Related contracts

- [ArtifactContract](../artifactcontract/)
- [ArtifactReference](../artifactreference/)
- [ArtifactStore](../artifactstore/)
- [TaskContext](../taskcontext/)
- [TaskOptions](../taskoptions/)
