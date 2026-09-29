---
title: "TaskCacheOutcome"
description: "TaskCacheOutcome — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TaskCacheOutcome } from "@elie-laloum/outpost";
```

## Purpose and behavior

Result of a task cache step, in the cache field of a workflow cache event. Values: "hit" (a valid entry was reused; the task completes without running), "miss" (no entry, entry older than maxAgeMs, or mode refresh), "stored" (the result was written after the task succeeded), "failed" (a store read, write or entry validation failed; the task continues as on a miss).

[Complete example and detailed rules](../../guide/task-cache/).

## Signature

```ts
export type TaskCacheOutcome = "hit" | "miss" | "stored" | "failed";
```
