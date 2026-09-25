---
title: "PromptVariables"
description: "PromptVariables — Outpost API"
sidebar:
  order: 10
---

Public contract for **PromptVariables**. See the [prompts and responses guide](../../guide/agents/responses/) for behavior, defaults and examples.

## Import

```ts
import type { PromptVariables } from "@elie-laloum/outpost";
```

## Purpose and behavior

Supply a literal or file brief and validate a tagged model answer before exposing its typed value.

Supply exactly one brief form. Expansion defaults to 30 seconds per original command. Response repairs default to zero. Structured responses require one pass.

[Complete example and detailed rules](../../guide/agents/responses/).

## Signature

```ts
export type PromptVariables = Readonly<
  Record<string, string | number | boolean>
>;
```
