---
title: "ArtifactTaskOptions"
description: "ArtifactTaskOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **ArtifactTaskOptions**. See the [typed artifacts guide](../../guide/advanced/artifacts/) for behavior, defaults and examples.

## Import

```ts
import type { ArtifactTaskOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publish immutable payloads and exchange small references with contract, digest and lineage validation.

Filesystem payloads default to 16 MiB maximum. Callers own retention. Digests provide integrity against a trusted reference, not producer authentication or a shared transaction.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name        | Type                                                                    | Presence | Meaning                                                                 |
| ----------- | ----------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `after`     | `readonly Task<unknown>[] \| undefined`                                 | Optional | Declared task dependencies whose values may be read.                    |
| `key`       | `string`                                                                | Required | Stable task or cache key within its owning contract.                    |
| `gate`      | `WorkflowGate \| undefined`                                             | Optional | See the linked contract and this family's rules for its interpretation. |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optional | Predicate evaluated before the first task attempt.                      |
| `retry`     | `Retry \| undefined`                                                    | Optional | Explicit retry policy; repeated effects require care.                   |
| `timeoutMs` | `number \| undefined`                                                   | Optional | Time limit in milliseconds for the owning operation.                    |
| `store`     | `ArtifactStore`                                                         | Required | Caller-supplied persistence implementation.                             |
| `contract`  | `ArtifactContract<T>`                                                   | Required | See the linked contract and this family's rules for its interpretation. |
| `produce`   | `(context: TaskContext) => T \| Promise<T>`                             | Required | See the linked contract and this family's rules for its interpretation. |
| `parents`   | `((context: TaskContext) => readonly ArtifactReference[]) \| undefined` | Optional | Ordered artifact parent references or identifiers.                      |

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
