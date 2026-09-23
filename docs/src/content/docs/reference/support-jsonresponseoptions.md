---
title: "JsonResponseOptions"
description: "JsonResponseOptions — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

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
