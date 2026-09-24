---
title: "ResourceInspection"
description: "ResourceInspection — Outpost API"
sidebar:
  order: 10
---

Public contract for **ResourceInspection**. See the [resource activity guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { ResourceInspection } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ResourceInspection {
  readonly scope: "recorded-sandboxes";
  readonly complete: boolean;
  readonly entries: readonly ResourceInspectionEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Related contracts

- [ResourceInspectionEntry](../resourceinspectionentry/)
- [StorageIssue](../support-storageissue/)
