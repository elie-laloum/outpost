---
title: "SteeringState"
description: "SteeringState — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { SteeringState } from "@elie-laloum/outpost";
```

## Purpose and behavior

State of a Steering controller. Values: "idle" (no dispatch attached; sent messages wait for the next one), "active" (attached to a running dispatch; undelivered messages reject with code steering when it ends), "closed" (close() was called; pending and later sends reject with code steering).

[Complete example and detailed rules](../../guide/steering/).

## Signature

```ts
export type SteeringState = "idle" | "active" | "closed";
```
