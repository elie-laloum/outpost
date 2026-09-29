---
title: "ModelStopReason"
description: "ModelStopReason — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ModelStopReason } from "@elie-laloum/outpost";
```

## Purpose and behavior

Why a model result ended, normalized by each model provider in ModelResult.stopReason. Values: "end" (final answer), "tool-calls" (the model requested tool calls), "max-tokens" (output or context window limit reached; the built-in harness fails with code limit), "refusal" (refusal or content filter; the built-in harness fails with code response).

[Complete example and detailed rules](../../guide/model-providers/).

## Signature

```ts
export type ModelStopReason = "end" | "tool-calls" | "max-tokens" | "refusal";
```
