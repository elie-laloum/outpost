---
title: "TriggerOutcome"
description: "TriggerOutcome — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TriggerOutcome } from "@elie-laloum/outpost";
```

## Purpose and behavior

Outcome of a verified webhook delivery, passed to TriggerSource.reply(). Values: "accepted" (the route published a queue job; default reply 202 with { job }), "ignored" (the route returned no job; default reply 204).

[Complete example and detailed rules](../../guide/webhooks/).

## Signature

```ts
export type TriggerOutcome = "accepted" | "ignored";
```
