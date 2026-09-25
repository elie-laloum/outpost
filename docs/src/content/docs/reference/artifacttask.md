---
title: "artifactTask"
description: "artifactTask — Outpost API"
sidebar:
  order: 10
---

Public contract for **artifactTask**. See the [typed artifacts guide](../../guide/advanced/artifacts/) for behavior, defaults and examples.

## Import

```ts
import { artifactTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publish immutable payloads and exchange small references with contract, digest and lineage validation.

Filesystem payloads default to 16 MiB maximum. Callers own retention. Digests provide integrity against a trusted reference, not producer authentication or a shared transaction.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name                | Type                                                                    | Presence | Meaning                                                                                  |
| ------------------- | ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`           | `ArtifactTaskOptions<T>`                                                | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                 | Optional | Declared task dependencies whose values may be read.                                     |
| `options.key`       | `string`                                                                | Required | Stable task or cache key within its owning contract.                                     |
| `options.gate`      | `WorkflowGate \| undefined`                                             | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optional | Predicate evaluated before the first task attempt.                                       |
| `options.retry`     | `Retry \| undefined`                                                    | Optional | Explicit retry policy; repeated effects require care.                                    |
| `options.timeoutMs` | `number \| undefined`                                                   | Optional | Time limit in milliseconds for the owning operation.                                     |
| `options.store`     | `ArtifactStore`                                                         | Required | Caller-supplied persistence implementation.                                              |
| `options.contract`  | `ArtifactContract<T>`                                                   | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.produce`   | `(context: TaskContext) => T \| Promise<T>`                             | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.parents`   | `((context: TaskContext) => readonly ArtifactReference[]) \| undefined` | Optional | Ordered artifact parent references or identifiers.                                       |

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
- [Task](../task/)
