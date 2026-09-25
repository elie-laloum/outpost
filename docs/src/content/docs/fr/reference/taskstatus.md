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

## Signature

```ts
export type TaskStatus =
  | "waiting"
  | "active"
  | "done"
  | "failed"
  | "skipped"
  | "cancelled"
  | "paused"
  | "rejected";
```
