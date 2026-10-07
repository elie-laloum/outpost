---
title: "StorageCategoryName"
description: "StorageCategoryName — Outpost API"
sidebar:
  order: 10
---

## Purpose and behavior

Category of a RecoveryInspection. inspectRecovery() scans .outpost/&lt;name> for "storage" (default local transport), "recovery" (retained recovery transfers), "logs", "locks" (workspace ownership locks) and "workspaces" (runtime worktrees); with a transporter it groups keys by first segment into "artifacts", "checkpoints", "conversations", "recovery", "logs", "reservations", "resources", "runs" and "task-cache".

## Signature

```ts
export type StorageCategoryName =
  | "storage"
  | "recovery"
  | "logs"
  | "locks"
  | "workspaces"
  | "artifacts"
  | "checkpoints"
  | "conversations"
  | "reservations"
  | "resources"
  | "runs"
  | "task-cache";
```
