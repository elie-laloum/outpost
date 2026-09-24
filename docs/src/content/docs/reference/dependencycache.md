---
title: "DependencyCache"
description: "DependencyCache — Outpost API"
sidebar:
  order: 10
---

Public contract for **DependencyCache**. See the [providers guide](../../providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { DependencyCache } from "@elie-laloum/outpost/providers/docker";
import type { DependencyCache } from "@elie-laloum/outpost/providers/podman";
```

## Signature

```ts
export interface DependencyCache {
  readonly name: string;
  readonly key: string;
}
```
