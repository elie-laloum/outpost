---
title: "JsonResponseOptions"
description: "JsonResponseOptions — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name         | Type                                                                                     | Presence          | Meaning                                                                                                                                                                                                                                                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`        | `string`                                                                                 | Required          | Tag name without angle brackets: a letter followed by letters, digits, _ or -. Another form fails with code configuration.                                                                                                                                                                                                                                  |
| `repairs`    | `number \| undefined`                                                                    | Optional          | Correction turns allowed after an invalid answer, default 0; must be a nonnegative integer. Above 0, the agent must be able to resume its conversation.                                                                                                                                                                                                     |
| `schema`     | `StandardJsonSchema<T> \| StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Required          | Standard Schema validator or a function receiving parsed JSON as unknown and returning the typed value, possibly transformed. Issues or thrown errors reject the answer. Automatic input-schema conversion requires Standard JSON Schema; otherwise jsonSchema is required.                                                                                 |
| `jsonSchema` | `Readonly<Record<string, unknown>> \| undefined \| Readonly<Record<string, unknown>>`    | Variant-dependent | Explicit input JSON Schema object included in automatic final-answer instructions. Required unless schema supports Standard JSON Schema conversion; takes precedence over conversion. Captured as a deeply frozen lossless JSON copy, excluding non-enumerable ~standard protocol metadata; schema remains the validator. No remote references are fetched. |

## Signature

```ts
export type JsonResponseOptions<T> = {
  tag: string;
  repairs?: number;
} & (
  | {
      schema: StandardJsonSchema<T>;
      jsonSchema?: JsonSchema;
    }
  | {
      schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
      jsonSchema: JsonSchema;
    }
);
```

## Related contracts

- [JsonSchema](../jsonschema/)
- [StandardJsonSchema](../standardjsonschema/)
- [StandardValidator](../standardvalidator/)
