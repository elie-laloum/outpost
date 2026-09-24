---
title: "FileArtifactStoreOptions"
description: "FileArtifactStoreOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **FileArtifactStoreOptions**. See the [typed artifacts guide](../../workflows/artifacts/) for behavior, defaults and examples.

## Import

```ts
import type { FileArtifactStoreOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface FileArtifactStoreOptions {
  readonly directory: string;
  readonly maxBytes?: number;
}
```
