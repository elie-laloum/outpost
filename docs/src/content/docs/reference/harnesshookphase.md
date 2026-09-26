---
title: "HarnessHookPhase"
description: "HarnessHookPhase — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Streaming is not available yet; the contract may change before release.
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
