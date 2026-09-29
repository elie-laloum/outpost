---
title: "defineJsonResponse"
description: "defineJsonResponse — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineJsonResponse } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare a tagged JSON response. The validator reads the last complete matching tag, accepts an optional json code fence, parses the contents and applies the Standard Schema validator or parsing function. Missing or invalid content raises ResponseError; repairs defaults to zero.

[Complete example and detailed rules](../../guide/typed-responses/).

## Parameters and properties

| Name              | Type                                                            | Presence | Meaning                                                                                                        |
| ----------------- | --------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `options`         | `JsonResponseOptions<T>`                                        | Required | Response tag, JSON schema or parsing function, and the number of repair turns allowed after an invalid answer. |
| `options.tag`     | `string`                                                        | Required | XML-style delimiter identifier.                                                                                |
| `options.schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Required | Boundary validator that narrows unknown input.                                                                 |
| `options.repairs` | `number \| undefined`                                           | Optional | Additional attempts to repair invalid structured output; zero by default.                                      |

## Returns

`ResponseSpec<T>`

## Signature

```ts
export declare function defineJsonResponse<T>(
  options: JsonResponseOptions<T>,
): ResponseSpec<T>;
```

## Related contracts

- [JsonResponseOptions](../support-jsonresponseoptions/)
- [ResponseSpec](../responsespec/)
