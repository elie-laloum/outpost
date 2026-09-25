---
title: "StorageEntry"
description: "StorageEntry — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                                                 |
| ------------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `name`        | `string`              | Required | See the linked contract and this family's rules for its interpretation. |
| `path`        | `string`              | Required | See the linked contract and this family's rules for its interpretation. |
| `kind`        | `StorageEntryKind`    | Required | See the linked contract and this family's rules for its interpretation. |
| `modifiedAt`  | `string \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `complete`    | `boolean`             | Required | See the linked contract and this family's rules for its interpretation. |
| `bytes`       | `number`              | Required | See the linked contract and this family's rules for its interpretation. |
| `files`       | `number`              | Required | See the linked contract and this family's rules for its interpretation. |
| `directories` | `number`              | Required | See the linked contract and this family's rules for its interpretation. |
| `symlinks`    | `number`              | Required | See the linked contract and this family's rules for its interpretation. |
| `other`       | `number`              | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface StorageEntry extends StorageUsage {
  readonly name: string;
  readonly path: string;
  kind: StorageEntryKind;
  modifiedAt?: string;
  complete: boolean;
}
```

## Related contracts

- [StorageEntryKind](../support-storageentrykind/)
- [StorageUsage](../support-storageusage/)
