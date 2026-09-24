---
title: "DependencyCache"
description: "DependencyCache — Outpost API"
sidebar:
  order: 10
---

Contrat public de **DependencyCache**. Consultez le [guide providers](../../providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

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
