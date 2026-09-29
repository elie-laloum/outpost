---
title: "createSteering"
description: "createSteering — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createSteering } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create an idle controller to pass as a dispatch's steering option. Its send() delivers instructions to the running agent: injected into the current turn when the agent accepts live input, otherwise by stopping the turn and resuming its conversation. A controller serves one dispatch at a time.

[Complete example and detailed rules](../../guide/steering/).

## Returns

`Steering`

## Signature

```ts
export declare function createSteering(): Steering;
```

## Related contracts

- [Steering](../steering/)
