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

Read an artifact reference from a declared task dependency through context.value, then load and validate its stored payload. It applies the task cancellation signal and checks the producer against the current execution and dependency key.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name         | Type                      | Presence | Meaning                                                                             |
| ------------ | ------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `context`    | `TaskContext`             | Required | Current workflow task context used to read dependencies and propagate cancellation. |
| `dependency` | `Task<ArtifactReference>` | Required | Declared task dependency whose completed output is the artifact reference to read.  |
| `contract`   | `ArtifactContract<T>`     | Required | Named, versioned artifact contract that defines encoding and validation.            |
| `store`      | `ArtifactStore`           | Required | Artifact byte store used for immutable publication or bounded payload retrieval.    |

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
