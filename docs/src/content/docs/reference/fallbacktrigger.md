---
title: "FallbackTrigger"
description: "FallbackTrigger — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { FallbackTrigger } from "@elie-laloum/outpost";
```

## Purpose and behavior

Failure category that hands a fallback agent's dispatch to its next candidate, listed in the on option of createFallbackAgent(). Values: "quota" (terminal usage or rate limit, code quota), "unavailable" (outage recognized by unavailableFault(); the error keeps its process, provider or timeout code).

[Complete example and detailed rules](../../guide/fallback-agents/).

## Signature

```ts
export type FallbackTrigger = "quota" | "unavailable";
```
