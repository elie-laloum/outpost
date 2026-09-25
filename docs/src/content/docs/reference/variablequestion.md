---
title: "VariableQuestion"
description: "VariableQuestion — Outpost API"
sidebar:
  order: 10
---

Public contract for **VariableQuestion**. See the [commands and terminal guide](../../guide/environment/commands/) for behavior, defaults and examples.

## Import

```ts
import type { VariableQuestion } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run a process or attach a native interactive agent session with explicit stream ownership.

Command returns nonzero exit statuses; callers must check them. Attach requires a supported interactive provider. Vercel rejects attachment.

[Complete example and detailed rules](../../guide/environment/commands/).

## Returns

`Promise<string>`

## Signature

```ts
export type VariableQuestion = (
  key: string,
  signal?: AbortSignal,
) => Promise<string>;
```
