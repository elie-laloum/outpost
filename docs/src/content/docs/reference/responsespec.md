---
title: "ResponseSpec"
description: "ResponseSpec — Outpost API"
sidebar:
  order: 10
---

Public contract for **ResponseSpec**. See the [prompts and responses guide](../../agents/responses/) for behavior, defaults and examples.

## Import

```ts
import type { ResponseSpec } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ResponseSpec<T> {
  readonly tag: string;
  readonly repairs: number;
  read(text: string): Promise<T>;
}
```
