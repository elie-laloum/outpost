---
title: "JsonResponseOptions"
description: "JsonResponseOptions — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name      | Type                                                            | Presence | Meaning                                                                   |
| --------- | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `tag`     | `string`                                                        | Required | XML-style delimiter identifier.                                           |
| `schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Required | Boundary validator that narrows unknown input.                            |
| `repairs` | `number \| undefined`                                           | Optional | Additional attempts to repair invalid structured output; zero by default. |

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
