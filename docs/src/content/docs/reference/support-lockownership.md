---
title: "LockOwnership"
description: "LockOwnership — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name     | Type                                  | Presence | Meaning                                                                               |
| -------- | ------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `status` | `"active" \| "unknown" \| "inactive"` | Required | Whether the recorded process is active, inactive or cannot be identified confidently. |
| `reason` | `string`                              | Required | Reason the local lock was classified with this ownership state.                       |

## Signature

```ts
export interface LockOwnership {
  readonly status: "active" | "inactive" | "unknown";
  readonly reason: string;
}
```
