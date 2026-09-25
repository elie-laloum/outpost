---
title: "readArtifact"
description: "readArtifact — Outpost API"
sidebar:
  order: 10
---

Public contract for **readArtifact**. See the [typed artifacts guide](../../guide/advanced/artifacts/) for behavior, defaults and examples.

## Import

```ts
import { readArtifact } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publish immutable payloads and exchange small references with contract, digest and lineage validation.

Filesystem payloads default to 16 MiB maximum. Callers own retention. Digests provide integrity against a trusted reference, not producer authentication or a shared transaction.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name         | Type                      | Presence | Meaning                                                                 |
| ------------ | ------------------------- | -------- | ----------------------------------------------------------------------- |
| `context`    | `TaskContext`             | Required | See the linked contract and this family's rules for its interpretation. |
| `dependency` | `Task<ArtifactReference>` | Required | See the linked contract and this family's rules for its interpretation. |
| `contract`   | `ArtifactContract<T>`     | Required | See the linked contract and this family's rules for its interpretation. |
| `store`      | `ArtifactStore`           | Required | Caller-supplied persistence implementation.                             |

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
- [Task](../task/)
- [TaskContext](../taskcontext/)
