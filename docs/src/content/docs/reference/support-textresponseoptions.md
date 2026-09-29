---
title: "TextResponseOptions"
description: "TextResponseOptions — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name      | Type                  | Presence | Meaning                                                                                                                                                 |
| --------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`     | `string`              | Required | Tag name without angle brackets: a letter followed by letters, digits, _ or -. Another form fails with code configuration.                              |
| `repairs` | `number \| undefined` | Optional | Correction turns allowed after an invalid answer, default 0; must be a nonnegative integer. Above 0, the agent must be able to resume its conversation. |

## Signature

```ts
export type TextResponseOptions = {
  tag: string;
  repairs?: number;
};
```
