---
title: "PromptVariables"
description: "PromptVariables — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { PromptVariables } from "@elie-laloum/outpost";
```

## Purpose and behavior

Values for the {{name}} placeholders of a file brief (Brief.values): strings, finite numbers or booleans. WORK_BRANCH and BASE_BRANCH are reserved; a placeholder without a value fails with code prompt.

[Complete example and detailed rules](../../guide/briefs/).

## Signature

```ts
export type PromptVariables = Readonly<
  Record<string, string | number | boolean>
>;
```
