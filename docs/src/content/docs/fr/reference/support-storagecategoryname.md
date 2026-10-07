---
title: "StorageCategoryName"
description: "StorageCategoryName — Outpost API"
sidebar:
  order: 10
---

## Rôle et comportement

Catégorie d’une RecoveryInspection. inspectRecovery() parcourt .outpost/&lt;name> pour "storage" (transport local par défaut), "recovery" (transferts de recovery conservés), "logs", "locks" (verrous de possession des workspaces) et "workspaces" (worktrees d’exécution) ; avec un transporter, elle regroupe les clés par premier segment en "artifacts", "checkpoints", "conversations", "recovery", "logs", "reservations", "resources", "runs" et "task-cache".

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
