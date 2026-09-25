---
title: "TextResponseOptions"
description: "TextResponseOptions — Outpost API"
sidebar:
  order: 10
---

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
