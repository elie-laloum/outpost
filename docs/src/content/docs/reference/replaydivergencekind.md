---
title: "ReplayDivergenceKind"
description: "ReplayDivergenceKind — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ReplayDivergenceKind } from "@elie-laloum/outpost";
```

## Purpose and behavior

Kind of mismatch a replay agent detects, in ReplayDivergence.kind. Values: "prompt" (the turn received a prompt that differs from the recording), "baseline" (the turn started from a different workspace tree), "tree" (a recorded commit could not be reproduced; always fatal when its patch fails to apply), "exhausted" (the journal has no more turns; always fatal), "unrecorded" (the journal has no workspace commits because it was recorded without logging.replayable).

[Complete example and detailed rules](../../guide/record-replay/).

## Signature

```ts
export type ReplayDivergenceKind =
  "prompt" | "baseline" | "tree" | "exhausted" | "unrecorded";
```
