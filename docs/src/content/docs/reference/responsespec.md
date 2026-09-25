---
title: "ResponseSpec"
description: "ResponseSpec — Outpost API"
sidebar:
  order: 10
---

Public contract for **ResponseSpec**. See the [prompts and responses guide](../../guide/agents/responses/) for behavior, defaults and examples.

## Import

```ts
import type { ResponseSpec } from "@elie-laloum/outpost";
```

## Purpose and behavior

Supply a literal or file brief and validate a tagged model answer before exposing its typed value.

Supply exactly one brief form. Expansion defaults to 30 seconds per original command. Response repairs default to zero. Structured responses require one pass.

[Complete example and detailed rules](../../guide/agents/responses/).

## Parameters and properties

| Name      | Type                           | Presence | Meaning                                                                   |
| --------- | ------------------------------ | -------- | ------------------------------------------------------------------------- |
| `tag`     | `string`                       | Required | XML-style delimiter identifier.                                           |
| `repairs` | `number`                       | Required | Additional attempts to repair invalid structured output; zero by default. |
| `read`    | `(text: string) => Promise<T>` | Required | See the linked contract and this family's rules for its interpretation.   |

## Signature

```ts
export interface ResponseSpec<T> {
  readonly tag: string;
  readonly repairs: number;
  read(text: string): Promise<T>;
}
```
