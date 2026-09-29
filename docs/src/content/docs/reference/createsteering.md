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

Create an idle Steering controller. Pass it to a dispatch as steering; send() then delivers instructions to the running agent: injected into the built-in harness loop or Claude Code's stream-json input, otherwise by stopping and resuming the conversation. Creating it starts nothing.

[Complete example and detailed rules](../../guide/agents/dispatch/).

## Returns

`Steering`

## Signature

```ts
export declare function createSteering(): Steering;
```

## Related contracts

- [Steering](../steering/)
