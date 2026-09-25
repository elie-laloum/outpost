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

| Name        | Type                                                                    | Presence | Meaning                                                                                                  |
| ----------- | ----------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `after`     | `readonly Task<unknown>[] \| undefined`                                 | Optional | Declared task dependencies whose values may be read.                                                     |
| `key`       | `string`                                                                | Required | Stable task key identifying the node within its workflow graph.                                          |
| `gate`      | `WorkflowGate \| undefined`                                             | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision. |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optional | Predicate evaluated before the first task attempt.                                                       |
| `retry`     | `Retry \| undefined`                                                    | Optional | Explicit retry policy; repeated effects require care.                                                    |
| `timeoutMs` | `number \| undefined`                                                   | Optional | Time limit in milliseconds for each task attempt; cancellation is cooperative through context.signal.    |
| `store`     | `ArtifactStore`                                                         | Required | Artifact byte store used for immutable publication or bounded payload retrieval.                         |
| `contract`  | `ArtifactContract<T>`                                                   | Required | Named, versioned artifact contract that defines encoding and validation.                                 |
| `produce`   | `(context: TaskContext) => T \| Promise<T>`                             | Required | Compute the typed artifact value from the task context and declared dependencies.                        |
| `parents`   | `((context: TaskContext) => readonly ArtifactReference[]) \| undefined` | Optional | Read parent artifact references from task dependencies to record publication lineage.                    |

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
