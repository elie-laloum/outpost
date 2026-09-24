---
title: "FileManifestEntry"
description: "FileManifestEntry — Outpost API"
sidebar:
  order: 10
---

Public contract for **FileManifestEntry**. See the [remote transfers guide](../../operations/remote-transfers/) for behavior, defaults and examples.

## Import

```ts
import type { FileManifestEntry } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface FileManifestEntry {
  readonly path: string;
  readonly kind: "file" | "link";
  readonly mode: number;
  readonly size: number;
  readonly sha256: string;
}
```
