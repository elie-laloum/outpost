---
title: "FileManifestEntry"
description: "FileManifestEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileManifestEntry } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type               | Presence | Meaning                                                                            |
| -------- | ------------------ | -------- | ---------------------------------------------------------------------------------- |
| `path`   | `string`           | Required | Relative path of this file or symbolic link within the transferred tree.           |
| `kind`   | `"file" \| "link"` | Required | Whether this manifest entry contains regular file bytes or a symbolic link target. |
| `mode`   | `number`           | Required | Filesystem permission bits to preserve during transfer.                            |
| `size`   | `number`           | Required | Byte size of the file contents or link target described by the manifest.           |
| `sha256` | `string`           | Required | SHA-256 digest used to verify the transferred file or link contents.               |

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
