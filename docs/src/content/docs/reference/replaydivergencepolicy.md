---
title: "ReplayDivergencePolicy"
description: "ReplayDivergencePolicy — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ReplayDivergencePolicy } from "@elie-laloum/outpost";
```

## Purpose and behavior

divergence option of createReplayAgent(). Values: "fail" (default; throw ReplayDivergence with code replay), "warn" (report the divergence through the dispatch warn callback and continue). Exhausted journals and patches that fail to apply always fail.

[Complete example and detailed rules](../../guide/record-replay/).

## Signature

```ts
export type ReplayDivergencePolicy = "fail" | "warn";
```
