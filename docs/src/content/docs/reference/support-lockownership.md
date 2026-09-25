---
title: "LockOwnership"
description: "LockOwnership — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name     | Type                                  | Presence | Meaning                                                                 |
| -------- | ------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `status` | `"unknown" \| "active" \| "inactive"` | Required | Recorded process or lifecycle outcome; inspect its declared type.       |
| `reason` | `string`                              | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface LockOwnership {
  readonly status: "active" | "inactive" | "unknown";
  readonly reason: string;
}
```
