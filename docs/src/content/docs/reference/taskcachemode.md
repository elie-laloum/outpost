---
title: "TaskCacheMode"
description: "TaskCacheMode — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TaskCacheMode } from "@elie-laloum/outpost";
```

## Purpose and behavior

mode of a task cache. Values: "reuse" (default; return a valid stored value instead of running the task), "refresh" (skip the lookup, run the task and overwrite the entry).

[Complete example and detailed rules](../../guide/task-cache/).

## Signature

```ts
export type TaskCacheMode = "reuse" | "refresh";
```
