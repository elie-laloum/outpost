---
title: "response"
description: "response — Outpost API"
sidebar:
  order: 10
---

Public contract for **response**. See the [prompts and responses guide](../../agents/responses/) for behavior, defaults and examples.

## Import

```ts
import { response } from "@elie-laloum/outpost";
```

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
