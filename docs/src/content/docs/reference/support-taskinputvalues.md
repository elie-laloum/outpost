---
title: "TaskInputValues"
description: "TaskInputValues — Outpost API"
sidebar:
  order: 10
---

## Purpose and behavior

Read-only mapping from each named task dependency to its inferred output type. Used by the named-input overload of defineTask().

## Signature

```ts
export type TaskInputValues<Inputs extends Readonly<Record<string, Task>>> = {
  readonly [Key in keyof Inputs]: Inputs[Key] extends Task<infer Value>
    ? Value
    : never;
};
```

## Related contracts

- [Task](../type-task/)
