---
title: "defineTextResponse"
description: "defineTextResponse — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineTextResponse } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare a text response with automatic tagged final-answer instructions. Returns the trimmed content of the last complete tag pair; missing tags fail with ResponseError. Invalid tags or repair counts fail with code configuration.

[Complete example and detailed rules](../../guide/typed-responses/).

## Parameters and properties

| Name              | Type                  | Presence | Meaning                                                                                                                                                 |
| ----------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `TextResponseOptions` | Required | Tag used by automatic final-answer instructions and allowed repair turns.                                                                               |
| `options.tag`     | `string`              | Required | Tag name without angle brackets: a letter followed by letters, digits, _ or -. Another form fails with code configuration.                              |
| `options.repairs` | `number \| undefined` | Optional | Correction turns allowed after an invalid answer, default 0; must be a nonnegative integer. Above 0, the agent must be able to resume its conversation. |

## Returns

`ResponseSpec<string>`

## Signature

```ts
export declare function defineTextResponse(
  options: TextResponseOptions,
): ResponseSpec<string>;
```

## Related contracts

- [ResponseSpec](../responsespec/)
- [TextResponseOptions](../support-textresponseoptions/)
