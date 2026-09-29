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

Declare a response read from the last complete &lt;tag>…&lt;/tag> pair, parsed as JSON, optionally inside a Markdown code fence, then checked by schema. A missing tag, invalid JSON, schema issues or a thrown parse error fail with ResponseError; an invalid tag or repairs fails with code configuration.

[Complete example and detailed rules](../../guide/typed-responses/).

## Parameters and properties

| Name              | Type                                                            | Presence | Meaning                                                                                                                                                                                     |
| ----------------- | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `JsonResponseOptions<T>`                                        | Required | Tag name, schema or parsing function, and the number of repair turns allowed after an invalid answer.                                                                                       |
| `options.tag`     | `string`                                                        | Required | Tag name without angle brackets: a letter followed by letters, digits, _ or -. Another form fails with code configuration.                                                                  |
| `options.schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Required | Standard Schema validator, such as Zod or Valibot, or a function that receives the parsed JSON as unknown and returns the typed value. Reported issues or a thrown error reject the answer. |
| `options.repairs` | `number \| undefined`                                           | Optional | Correction turns allowed after an invalid answer, default 0; must be a nonnegative integer. Above 0, the agent must be able to resume its conversation.                                     |

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
