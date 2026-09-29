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

| Name   | Type     | Presence | Meaning                                                                                                                                    |
| ------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `name` | `string` | Required | Cache name and directory under /outpost/cache: up to 48 lowercase letters, digits or hyphens, starting with a letter, unique per provider. |
| `key`  | `string` | Required | Invalidation key of 1 to 1024 characters; changing it selects a new engine volume.                                                         |

## Signature

```ts
export interface DependencyCache {
  readonly name: string;
  readonly key: string;
}
```
