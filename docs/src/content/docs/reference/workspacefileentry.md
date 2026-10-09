---
title: "WorkspaceFileEntry"
description: "WorkspaceFileEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceFileEntry } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                              | Presence | Meaning                                                                                          |
| -------- | --------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `path`   | `string`                          | Required | Validated relative path preserving its prefix; traversal and control paths are refused.          |
| `kind`   | `"file" \| "link" \| "directory"` | Required | Validated regular file, relative internal symbolic link or directory; special files are refused. |
| `mode`   | `number`                          | Required | Portable permission bits retained for regular files and directories.                             |
| `size`   | `number`                          | Required | Size in bytes of the validated file content or link target.                                      |
| `sha256` | `string`                          | Required | SHA-256 content digest for integrity and concurrency checks, without publisher authentication.   |
| `target` | `string \| undefined`             | Optional | Relative symbolic link target that must remain inside the declared selection.                    |

## Signature

```ts
export interface WorkspaceFileEntry {
  readonly path: string;
  readonly kind: "file" | "link" | "directory";
  readonly mode: number;
  readonly size: number;
  readonly sha256: string;
  readonly target?: string;
}
```
