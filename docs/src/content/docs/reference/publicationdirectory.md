---
title: "PublicationDirectory"
description: "PublicationDirectory — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { PublicationDirectory } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                   | Presence | Meaning                                                                                               |
| ------------- | ---------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `path`        | `string`                                                               | Required | Validated relative path preserving its prefix; traversal and control paths are refused.               |
| `mode`        | `number`                                                               | Required | Portable permission bits retained for regular files and directories.                                  |
| `identity`    | `{ readonly device: number; readonly inode: number; } \| undefined`    | Optional | Device and inode identity used to detect replacement and known filesystem aliases.                    |
| `createdMode` | `number \| undefined`                                                  | Optional | Initial owned directory permissions, retained to distinguish publication changes from external edits. |
| `phase`       | `"pending" \| "restored" \| "create-intent" \| "created" \| "settled"` | Required | Durable intent/result phase allowing finish or rollback without rerunning workflow tasks.             |

## Signature

```ts
export interface PublicationDirectory {
  readonly path: string;
  readonly mode: number;
  identity?: {
    readonly device: number;
    readonly inode: number;
  };
  createdMode?: number;
  phase: "pending" | "create-intent" | "created" | "settled" | "restored";
}
```
