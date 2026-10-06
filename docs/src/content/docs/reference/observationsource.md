---
title: "ObservationSource"
description: "ObservationSource — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ObservationSource } from "@elie-laloum/outpost";
```

## Purpose and behavior

Component that emitted an Observation, in its source field. Values: "decision" (typed decision lifecycle and verbose payloads), "agent" (CLI agent events), "harness" (built-in harness events), "workflow" (workflow events), "sandbox" (sandbox allocation, dispatch and release), "git" (workspace allocation and branch integration), "hooks" (workspace lifecycle hooks), "transfer" (file transfers and repository synchronization), "conversation" (conversation capture and restore), "recovery" (startup-failure handling and recovery retention).

[Complete example and detailed rules](../../guide/observability/).

## Signature

```ts
export type ObservationSource =
  | "decision"
  | "agent"
  | "harness"
  | "workflow"
  | "sandbox"
  | "git"
  | "hooks"
  | "transfer"
  | "conversation"
  | "recovery";
```
