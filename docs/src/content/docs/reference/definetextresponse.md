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

Declare a tagged text response. The validator reads the last complete matching tag and returns its trimmed contents as a string. Missing or invalid content raises ResponseError; repairs defaults to zero.

[Complete example and detailed rules](../../guide/typed-responses/).

## Parameters and properties

| Name              | Type                  | Presence | Meaning                                                                                                           |
| ----------------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `options`         | `TextResponseOptions` | Required | Response tag, written as an XML-style identifier, and the number of repair turns allowed after an invalid answer. |
| `options.tag`     | `string`              | Required | XML-style delimiter identifier.                                                                                   |
| `options.repairs` | `number \| undefined` | Optional | Additional attempts to repair invalid structured output; zero by default.                                         |

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
