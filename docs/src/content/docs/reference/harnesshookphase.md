---
title: "HarnessHookPhase"
description: "HarnessHookPhase — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { HarnessHookPhase } from "@elie-laloum/outpost";
```

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
