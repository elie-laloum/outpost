---
title: "TextResponseOptions"
description: "TextResponseOptions — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Supply a literal or file brief and validate a tagged model answer before exposing its typed value.

Supply exactly one brief form. Expansion defaults to 30 seconds per original command. Response repairs default to zero. Structured responses require one pass.

[Complete example and detailed rules](../../guide/agents/responses/).

## Parameters and properties

| Name      | Type                  | Presence | Meaning                                                                   |
| --------- | --------------------- | -------- | ------------------------------------------------------------------------- |
| `tag`     | `string`              | Required | XML-style delimiter identifier.                                           |
| `repairs` | `number \| undefined` | Optional | Additional attempts to repair invalid structured output; zero by default. |

## Signature

```ts
export type TextResponseOptions = {
  tag: string;
  repairs?: number;
};
```
