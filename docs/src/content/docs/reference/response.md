---
title: "response"
description: "response — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { response } from "@elie-laloum/outpost";
```

## Purpose and behavior

Construct tagged response validators with text or json. Both read the last complete matching tag; json parses its contents and applies the supplied schema. Invalid or missing content raises ResponseError, and repairs defaults to zero.

[Complete example and detailed rules](../../guide/agents/responses/).

## Parameters and properties

| Name   | Type                                                      | Presence | Meaning                                                                                                |
| ------ | --------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `text` | `(options: TextResponseOptions) => ResponseSpec<string>`  | Required | Build a validator that returns trimmed content of the last complete tag as a string.                   |
| `json` | `<T>(options: JsonResponseOptions<T>) => ResponseSpec<T>` | Required | Build a validator that parses tagged JSON and applies a Standard Schema validator or parsing function. |

## Signature

```ts
export declare const response: {
  text: (options: TextResponseOptions) => ResponseSpec<string>;
  json: <T>(options: JsonResponseOptions<T>) => ResponseSpec<T>;
};
```

## Related contracts

- [JsonResponseOptions](../support-jsonresponseoptions/)
- [ResponseSpec](../responsespec/)
- [TextResponseOptions](../support-textresponseoptions/)
