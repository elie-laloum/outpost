---
title: "ModelStopReason"
description: "ModelStopReason — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: provider contract for custom harnesses with messages, tool calls, replayable reasoning, history caching and streaming. It may change in a later release.
:::

## Import

```ts
import type { ModelStopReason } from "@elie-laloum/outpost";
```

## Signature

```ts
export type ModelStopReason = "end" | "tool-calls" | "max-tokens" | "refusal";
```
