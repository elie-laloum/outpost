---
title: "DependencyCache"
description: "DependencyCache — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DependencyCache } from "@elie-laloum/outpost/providers/docker";
import type { DependencyCache } from "@elie-laloum/outpost/providers/podman";
```

## Parameters and properties

| Name   | Type     | Presence | Meaning                                                                                                            |
| ------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `name` | `string` | Required | Logical cache name used in the mount path; the engine volume name is derived from repository, image, user and key. |
| `key`  | `string` | Required | Caller-defined cache invalidation key; changing it selects a new engine volume.                                    |

## Signature

```ts
export interface DependencyCache {
  readonly name: string;
  readonly key: string;
}
```
