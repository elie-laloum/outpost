---
title: "inspectWorkspacePathLocks"
description: "inspectWorkspacePathLocks — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { inspectWorkspacePathLocks } from "@elie-laloum/outpost";
```

## Purpose and behavior

Lists host-user locks coordinating overlapping materializations, mounts and publication destinations across runtime directories.

[Complete example and detailed rules](../../guide/workspaces/).

## Returns

`Promise<readonly WorkspacePathLock[]>`

## Signature

```ts
export declare function inspectWorkspacePathLocks(): Promise<
  readonly WorkspacePathLock[]
>;
```

## Related contracts

- [WorkspacePathLock](../workspacepathlock/)
