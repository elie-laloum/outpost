---
title: "readArtifact"
description: "readArtifact — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { readArtifact } from "@elie-laloum/outpost";
```

## Purpose and behavior

Read the artifact published by a declared dependency: take its reference from context.value(), reject with Artifact dependency producer mismatch when another execution or task produced it, then verify and decode it like readStoredArtifact() under the task's signal.

[Complete example and detailed rules](../../guide/artifacts/).

## Parameters and properties

| Name         | Type                      | Presence | Meaning                                                                                                          |
| ------------ | ------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `context`    | `TaskContext`             | Required | Context of the running task; supplies the dependency output, the execution id and the cancellation signal.       |
| `dependency` | `Task<ArtifactReference>` | Required | Artifact task listed in this task's after; its output is the reference to read. An undeclared dependency throws. |
| `contract`   | `ArtifactContract<T>`     | Required | Expected contract; must match the reference's name, version and encoding.                                        |
| `store`      | `ArtifactStore`           | Required | Store holding the artifact bytes.                                                                                |

## Returns

`Promise<T>`

## Signature

```ts
export declare function readArtifact<T>(
  context: TaskContext,
  dependency: Task<ArtifactReference>,
  contract: ArtifactContract<T>,
  store: ArtifactStore,
): Promise<T>;
```

## Related contracts

- [ArtifactContract](../artifactcontract/)
- [ArtifactReference](../artifactreference/)
- [ArtifactStore](../artifactstore/)
- [Task](../type-task/)
- [TaskContext](../taskcontext/)
