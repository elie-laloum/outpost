---
title: "defineArtifactTask"
description: "defineArtifactTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineArtifactTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a workflow task whose output is an ArtifactReference: it runs produce(context) and publishes the value, with producer set from the execution id, task key and attempt. A retried attempt publishes a new reference. Dependents read the value with readArtifact().

[Complete example and detailed rules](../../guide/artifacts/).

## Parameters and properties

| Name                  | Type                                                                    | Presence | Meaning                                                                                                                                                                                                                      |
| --------------------- | ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `ArtifactTaskOptions<T>`                                                | Required | Task options (key, after, retry, cache…) plus store, contract, produce and parents; the artifact task supplies perform.                                                                                                      |
| `options.retry`       | `Retry \| undefined`                                                    | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                 |
| `options.key`         | `string`                                                                | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                    |
| `options.cache`       | `TaskCacheOptions \| undefined`                                         | Optional | Result cache: a hit restores the stored lossless JSON value with no attempt, usage or side effects. On a miss, a result that is not lossless JSON fails the task. Rejected on gates, interactions and dispatch-result tasks. |
| `options.gate`        | `WorkflowGate \| undefined`                                             | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                     |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                 | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                   |
| `options.interaction` | `TaskInteraction \| undefined`                                          | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                    |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                        |
| `options.timeoutMs`   | `number \| undefined`                                                   | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                  |
| `options.store`       | `ArtifactStore`                                                         | Required | Store that receives the published artifact.                                                                                                                                                                                  |
| `options.contract`    | `ArtifactContract<T>`                                                   | Required | Contract that validates and encodes the produced value.                                                                                                                                                                      |
| `options.produce`     | `(context: TaskContext) => T \| Promise<T>`                             | Required | Compute the value to publish from the task context, for example from context.value() of a dependency.                                                                                                                        |
| `options.parents`     | `((context: TaskContext) => readonly ArtifactReference[]) \| undefined` | Optional | Return the parent references to record, usually context.value() of artifact tasks listed in after. Runs before produce().                                                                                                    |

## Returns

`Task<ArtifactReference>`

## Signature

```ts
export declare function defineArtifactTask<T>(
  options: ArtifactTaskOptions<T>,
): Task<ArtifactReference>;
```

## Related contracts

- [ArtifactReference](../artifactreference/)
- [ArtifactTaskOptions](../artifacttaskoptions/)
- [Task](../type-task/)
