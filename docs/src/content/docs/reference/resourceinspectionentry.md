---
title: "ResourceInspectionEntry"
description: "ResourceInspectionEntry — Outpost API"
sidebar:
  order: 10
---

Public contract for **ResourceInspectionEntry**. See the [resource activity guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { ResourceInspectionEntry } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ResourceInspectionEntry {
  readonly path: string;
  readonly record?: ResourceActivityRecord;
  readonly ownership: LockOwnership;
}
```

## Related contracts

- [LockOwnership](../support-lockownership/)
- [ResourceActivityRecord](../resourceactivityrecord/)
