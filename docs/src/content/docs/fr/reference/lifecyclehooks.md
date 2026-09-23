---
title: "LifecycleHooks"
description: "LifecycleHooks — Outpost API"
sidebar:
  order: 10
---

Contrat public de **LifecycleHooks**. Consultez le [guide workspaces](../../sandboxes/workspaces/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { LifecycleHooks } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface LifecycleHooks {
  readonly workspaceReady?: readonly Command[];
  readonly hostReady?: readonly Command[];
  readonly sandboxReady?: readonly Command[];
}
```

## Contrats associés

- [Command](../command/)
