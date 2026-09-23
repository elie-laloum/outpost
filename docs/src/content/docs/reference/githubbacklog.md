---
title: "githubBacklog"
description: "githubBacklog — Outpost API"
sidebar:
  order: 10
---

Public contract for **githubBacklog**. See the [campaigns and backlogs guide](../../workflows/campaigns/) for behavior, defaults and examples.

## Import

```ts
import { githubBacklog } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function githubBacklog(
  settings?: BacklogSettings,
  executor?: Executor,
): Backlog;
```

## Related contracts

- [Backlog](../backlog/)
- [BacklogSettings](../backlogsettings/)
- [Executor](../support-executor/)
