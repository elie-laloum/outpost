---
title: "TaskInputValues"
description: "TaskInputValues — Outpost API"
sidebar:
  order: 10
---

## Rôle et comportement

Correspondance en lecture seule de chaque dépendance nommée vers son type de résultat inféré, utilisée par la surcharge à inputs nommés de defineTask().

## Signature

```ts
export type TaskInputValues<Inputs extends Readonly<Record<string, Task>>> = {
  readonly [Key in keyof Inputs]: Inputs[Key] extends Task<infer Value>
    ? Value
    : never;
};
```

## Contrats associés

- [Task](../type-task/)
