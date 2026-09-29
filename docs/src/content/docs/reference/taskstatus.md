---
title: "TaskStatus"
description: "TaskStatus — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TaskStatus } from "@elie-laloum/outpost";
```

## Purpose and behavior

Status of a workflow task in its TaskRecord, workflow events and checkpoints. Values: "waiting" (not started, or queued to run again), "active" (running), "done" (completed, including a cache hit or an approved gate), "failed" (threw an error), "skipped" (its condition returned false, or a dependency failed, was skipped, cancelled or rejected), "cancelled" (the workflow was aborted or its budget exhausted), "paused" (stopped at a gate or by a quota pause), "rejected" (a gate decision rejected it), "waiting-input" (an interactive task awaits an answer).

[Complete example and detailed rules](../../guide/task-dependencies/).

## Signature

```ts
export type TaskStatus =
  | "waiting-input"
  | "waiting"
  | "active"
  | "done"
  | "failed"
  | "skipped"
  | "cancelled"
  | "paused"
  | "rejected";
```
