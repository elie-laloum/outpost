---
title: "LockOwnership"
description: "LockOwnership — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name     | Type                                  | Presence | Meaning                                                                                                                                                          |
| -------- | ------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status` | `"active" \| "unknown" \| "inactive"` | Required | active: the PID runs with the recorded identity; inactive: the process exited; unknown: another host, boot or PID namespace, a reused PID or a missing identity. |
| `reason` | `string`                              | Required | Code behind the status, such as LOCAL_IDENTITY_MATCH, PROCESS_EXITED, OTHER_HOST, PID_REUSED or REMOTE_OWNER_UNVERIFIED.                                         |

## Signature

```ts
export interface LockOwnership {
  readonly status: "active" | "inactive" | "unknown";
  readonly reason: string;
}
```
