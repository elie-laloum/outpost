---
title: "artifactTask"
description: "artifactTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { artifactTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a workflow task that produces a value and publishes it as an artifact. Derive producer identity from the workflow execution, task key and attempt, and record the declared parent references. Dependents receive an ArtifactReference rather than the full payload.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name                | Type                                                                    | Presence | Meaning                                                                                                  |
| ------------------- | ----------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `options`           | `ArtifactTaskOptions<T>`                                                | Required | Task scheduling, artifact contract/store, value producer and parent-reference factory.                   |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                 | Optional | Declared task dependencies whose values may be read.                                                     |
| `options.key`       | `string`                                                                | Required | Stable task key identifying the node within its workflow graph.                                          |
| `options.gate`      | `WorkflowGate \| undefined`                                             | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision. |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optional | Predicate evaluated before the first task attempt.                                                       |
| `options.retry`     | `Retry \| undefined`                                                    | Optional | Explicit retry policy; repeated effects require care.                                                    |
| `options.timeoutMs` | `number \| undefined`                                                   | Optional | Time limit in milliseconds for each task attempt; cancellation is cooperative through context.signal.    |
| `options.store`     | `ArtifactStore`                                                         | Required | Artifact byte store used for immutable publication or bounded payload retrieval.                         |
| `options.contract`  | `ArtifactContract<T>`                                                   | Required | Named, versioned artifact contract that defines encoding and validation.                                 |
| `options.produce`   | `(context: TaskContext) => T \| Promise<T>`                             | Required | Compute the typed artifact value from the task context and declared dependencies.                        |
| `options.parents`   | `((context: TaskContext) => readonly ArtifactReference[]) \| undefined` | Optional | Read parent artifact references from task dependencies to record publication lineage.                    |

## Returns

`Task<ArtifactReference>`

## Signature

```ts
export declare function artifactTask<T>(
  options: ArtifactTaskOptions<T>,
): Task<ArtifactReference>;
```

## Related contracts

- [ArtifactReference](../artifactreference/)
- [ArtifactTaskOptions](../artifacttaskoptions/)
- [Task](../type-task/)
