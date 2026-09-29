---
title: "JsonResponseOptions"
description: "JsonResponseOptions — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name      | Type                                                            | Presence | Meaning                                                                                                                                                                                     |
| --------- | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`     | `string`                                                        | Required | Tag name without angle brackets: a letter followed by letters, digits, _ or -. Another form fails with code configuration.                                                                  |
| `schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Required | Standard Schema validator, such as Zod or Valibot, or a function that receives the parsed JSON as unknown and returns the typed value. Reported issues or a thrown error reject the answer. |
| `repairs` | `number \| undefined`                                           | Optional | Correction turns allowed after an invalid answer, default 0; must be a nonnegative integer. Above 0, the agent must be able to resume its conversation.                                     |

## Signature

```ts
export type JsonResponseOptions<T> = {
  tag: string;
  schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
  repairs?: number;
};
```

## Related contracts

- [StandardValidator](../standardvalidator/)
