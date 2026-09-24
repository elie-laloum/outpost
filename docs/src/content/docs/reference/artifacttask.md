---
title: "artifactTask"
description: "artifactTask — Outpost API"
sidebar:
  order: 10
---

Public contract for **artifactTask**. See the [typed artifacts guide](../../workflows/artifacts/) for behavior, defaults and examples.

## Import

```ts
import { artifactTask } from "@elie-laloum/outpost";
```

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
