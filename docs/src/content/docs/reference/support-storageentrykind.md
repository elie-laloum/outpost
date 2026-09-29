---
title: "StorageEntryKind"
description: "StorageEntryKind — Outpost API"
sidebar:
  order: 10
---

## Purpose and behavior

Kind of a StorageEntry in a storage inventory. Values: "file", "directory", "symlink" (counted, not followed), "other" (special file such as a socket or FIFO; the entry is incomplete), "unknown" (not measured because the entry limit was reached or the entry could not be read). Transport entries are always "file".

## Signature

```ts
export type StorageEntryKind =
  "file" | "directory" | "symlink" | "other" | "unknown";
```
