---
title: "StorageInventory"
description: "StorageInventory — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name             | Type                         | Presence | Meaning                                                                 |
| ---------------- | ---------------------------- | -------- | ----------------------------------------------------------------------- |
| `root`           | `string`                     | Required | See the linked contract and this family's rules for its interpretation. |
| `categories`     | `readonly StorageCategory[]` | Required | See the linked contract and this family's rules for its interpretation. |
| `usage`          | `Readonly<StorageUsage>`     | Required | Reported usage counters; not a currency estimate.                       |
| `issues`         | `readonly StorageIssue[]`    | Required | See the linked contract and this family's rules for its interpretation. |
| `complete`       | `boolean`                    | Required | See the linked contract and this family's rules for its interpretation. |
| `scannedEntries` | `number`                     | Required | See the linked contract and this family's rules for its interpretation. |
| `maxEntries`     | `number`                     | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface StorageInventory {
  readonly root: string;
  readonly categories: readonly StorageCategory[];
  readonly usage: Readonly<StorageUsage>;
  readonly issues: readonly StorageIssue[];
  readonly complete: boolean;
  readonly scannedEntries: number;
  readonly maxEntries: number;
}
```

## Related contracts

- [StorageCategory](../support-storagecategory/)
- [StorageIssue](../support-storageissue/)
- [StorageUsage](../support-storageusage/)
