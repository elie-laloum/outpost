---
title: "ModelStopReason"
description: "ModelStopReason — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: provider-neutral messages, tool calls and replayable reasoning for model transports. No streaming yet; the contract may change before release.
:::

## Import

```ts
import type { ModelStopReason } from "@elie-laloum/outpost";
```

## Signature

```ts
export type ModelStopReason = "end" | "tool-calls" | "max-tokens" | "refusal";
```
