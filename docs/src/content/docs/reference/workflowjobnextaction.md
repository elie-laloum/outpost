---
title: "WorkflowJobNextAction"
description: "WorkflowJobNextAction — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowJobNextAction } from "@elie-laloum/outpost/queues";
```

## Purpose and behavior

Operator action derived from a saved workflow status: none after done, answer for waiting-input, inspect-pause for paused, and inspect for failed, cancelled or rejected runs.

[Complete example and detailed rules](../../guide/queued-workflows/).

## Signature

```ts
export type WorkflowJobNextAction =
  "none" | "answer" | "inspect-pause" | "inspect";
```
