---
title: "ResourceOperation"
description: "ResourceOperation — Outpost API"
sidebar:
  order: 10
---

Public contract for **ResourceOperation**. See the [resource activity guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { ResourceOperation } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ResourceOperation {
  readonly count: number;
  readonly kind: ResourceOperationKind;
  readonly startedAt: string;
}
```

## Related contracts

- [ResourceOperationKind](../resourceoperationkind/)
