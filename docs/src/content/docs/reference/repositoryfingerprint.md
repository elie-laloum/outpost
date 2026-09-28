---
title: "repositoryFingerprint"
description: "repositoryFingerprint — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { repositoryFingerprint } from "@elie-laloum/outpost";
```

## Purpose and behavior

Return a SHA-256 digest of a repository’s HEAD commit, tracked working-tree changes, index and untracked files, excluding .outpost/. Use it in task cache keys so uncommitted edits change the key. It reads the repository without modifying it and fails outside a Git repository.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name         | Type     | Presence | Meaning                                                                                                      |
| ------------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `repository` | `string` | Required | Path to a Git repository or one of its subdirectories; the fingerprint always covers the whole working tree. |

## Returns

`Promise<string>`

## Signature

```ts
export declare function repositoryFingerprint(
  repository: string,
): Promise<string>;
```
