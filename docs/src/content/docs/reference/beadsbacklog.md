---
title: "beadsBacklog"
description: "beadsBacklog — Outpost API"
sidebar:
  order: 10
---

Public contract for **beadsBacklog**. See the [campaigns and backlogs guide](../../workflows/campaigns/) for behavior, defaults and examples.

## Import

```ts
import { beadsBacklog } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function beadsBacklog(
  settings?: BacklogSettings,
  executor?: Executor,
): Backlog;
```

## Related contracts

- [Backlog](../backlog/)
- [BacklogSettings](../backlogsettings/)
- [Executor](../support-executor/)
