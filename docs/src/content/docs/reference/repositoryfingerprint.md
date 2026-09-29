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

Return a SHA-256 hex digest of a repository's HEAD commit, staged and unstaged changes and untracked files that are not ignored, excluding .outpost/. Use it in a task cache key so uncommitted edits change the key. Reads without modifying; rejects outside a Git repository.

[Complete example and detailed rules](../../guide/task-cache/).

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
