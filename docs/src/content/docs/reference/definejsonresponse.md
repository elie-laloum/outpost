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

Declare a JSON response with automatic tagged final-answer instructions and an input JSON Schema. Converts Standard JSON Schema input automatically unless jsonSchema is explicit; missing, failed or non-lossless schemas fail with code configuration. Reads the last complete tag, accepts JSON code fences and validates with schema; rejected content fails with ResponseError.

[Complete example and detailed rules](../../guide/typed-responses/).

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name                 | Type                                                                                     | Presence          | Meaning                                                                                                                                                                                                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `JsonResponseOptions<T>`                                                                 | Required          | Tag, validator, input JSON Schema when automatic conversion is unavailable, and allowed repair turns.                                                                                                                                                                                                                                                       |
| `options.tag`        | `string`                                                                                 | Required          | Tag name without angle brackets: a letter followed by letters, digits, _ or -. Another form fails with code configuration.                                                                                                                                                                                                                                  |
| `options.repairs`    | `number \| undefined`                                                                    | Optional          | Correction turns allowed after an invalid answer, default 0; must be a nonnegative integer. Above 0, the agent must be able to resume its conversation.                                                                                                                                                                                                     |
| `options.schema`     | `StandardJsonSchema<T> \| StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Required          | Standard Schema validator or a function receiving parsed JSON as unknown and returning the typed value, possibly transformed. Issues or thrown errors reject the answer. Automatic input-schema conversion requires Standard JSON Schema; otherwise jsonSchema is required.                                                                                 |
| `options.jsonSchema` | `Readonly<Record<string, unknown>> \| undefined \| Readonly<Record<string, unknown>>`    | Variant-dependent | Explicit input JSON Schema object included in automatic final-answer instructions. Required unless schema supports Standard JSON Schema conversion; takes precedence over conversion. Captured as a deeply frozen lossless JSON copy, excluding non-enumerable ~standard protocol metadata; schema remains the validator. No remote references are fetched. |

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
