---
title: "PromptVariables"
description: "PromptVariables — Outpost API"
sidebar:
  order: 10
---

Public contract for **PromptVariables**. See the [prompts and responses guide](../../agents/responses/) for behavior, defaults and examples.

## Import

```ts
import type { PromptVariables } from "@elie-laloum/outpost";
```

## Signature

```ts
export type PromptVariables = Readonly<
  Record<string, string | number | boolean>
>;
```
