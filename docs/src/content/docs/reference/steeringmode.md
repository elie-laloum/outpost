---
title: "SteeringMode"
description: "SteeringMode — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { SteeringMode } from "@elie-laloum/outpost";
```

## Purpose and behavior

How a steering instruction reached the agent, in SteeringDelivery.mode. Values: "injected" (joined the running turn through live input or the built-in harness loop), "resumed" (Outpost stopped the turn and continued the conversation in a new turn).

[Complete example and detailed rules](../../guide/steering/).

## Signature

```ts
export type SteeringMode = "injected" | "resumed";
```
