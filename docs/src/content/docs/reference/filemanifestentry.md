---
title: "FileManifestEntry"
description: "FileManifestEntry — Outpost API"
sidebar:
  order: 10
---

Public contract for **FileManifestEntry**. See the [remote transfers guide](../../guide/operations/remote-transfers/) for behavior, defaults and examples.

## Import

```ts
import type { FileManifestEntry } from "@elie-laloum/outpost";
```

## Purpose and behavior

Move binary files and validated manifests while preserving concurrent host edits.

Synchronization validates and backs up before applying incoming work. Transfers preserve supported permissions and symlinks and reject unsafe destination traversal. Recovery data survives unsafe cleanup.

[Complete example and detailed rules](../../guide/operations/remote-transfers/).

## Parameters and properties

| Name     | Type               | Presence | Meaning                                                                 |
| -------- | ------------------ | -------- | ----------------------------------------------------------------------- |
| `path`   | `string`           | Required | See the linked contract and this family's rules for its interpretation. |
| `kind`   | `"file" \| "link"` | Required | See the linked contract and this family's rules for its interpretation. |
| `mode`   | `number`           | Required | See the linked contract and this family's rules for its interpretation. |
| `size`   | `number`           | Required | See the linked contract and this family's rules for its interpretation. |
| `sha256` | `string`           | Required | See the linked contract and this family's rules for its interpretation. |

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
