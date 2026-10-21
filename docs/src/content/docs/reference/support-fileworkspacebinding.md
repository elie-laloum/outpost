---
title: "FileWorkspaceBinding"
description: "FileWorkspaceBinding — Outpost API"
sidebar:
  order: 10
---

## Purpose and behavior

How a file workspace reaches its sandbox: copy transfers the files, ephemeral starts empty, mount-readonly and mount-write expose the source directory. Providers list the bindings they support in workspaces.bindings, and recipe plans report the one a workspace requires.

## Signature

```ts
export type FileWorkspaceBinding =
  "copy" | "ephemeral" | "mount-readonly" | "mount-write";
```
