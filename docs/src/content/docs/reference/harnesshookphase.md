---
title: "HarnessHookPhase"
description: "HarnessHookPhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessHookPhase } from "@elie-laloum/outpost";
```

## Purpose and behavior

Point of the built-in harness loop where a hook runs, set by its on option. Values: "session-start" (once, before the first model request), "before-model" (before each model request), "after-model" (after each model result), "before-tool" (before each tool call), "after-tool" (after each tool result), "stop" (when the model gives a final answer).

[Complete example and detailed rules](../../guide/harness-permissions/).

## Signature

```ts
export type HarnessHookPhase =
  | "session-start"
  | "before-model"
  | "after-model"
  | "before-tool"
  | "after-tool"
  | "stop";
```
