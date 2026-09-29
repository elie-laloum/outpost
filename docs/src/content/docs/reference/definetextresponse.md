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

Declare a response whose value is the trimmed text of the last complete &lt;tag>…&lt;/tag> pair. It fails with ResponseError only when no complete pair exists; an invalid tag or repairs fails with code configuration.

[Complete example and detailed rules](../../guide/typed-responses/).

## Parameters and properties

| Name              | Type                  | Presence | Meaning                                                                                                                                                 |
| ----------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `TextResponseOptions` | Required | Tag name and the number of repair turns allowed after an invalid answer.                                                                                |
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
