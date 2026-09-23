---
title: "Backlog"
description: "Backlog — Outpost API"
sidebar:
  order: 10
---

Public contract for **Backlog**. See the [campaigns and backlogs guide](../../workflows/campaigns/) for behavior, defaults and examples.

## Import

```ts
import type { Backlog } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Backlog {
  list(signal?: AbortSignal): Promise<readonly Issue[]>;
  get(id: string, signal?: AbortSignal): Promise<Issue>;
  close(id: string, signal?: AbortSignal): Promise<void>;
}
```

## Related contracts

- [Issue](../issue/)
