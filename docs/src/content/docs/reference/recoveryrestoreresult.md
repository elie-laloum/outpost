---
title: "RecoveryRestoreResult"
description: "RecoveryRestoreResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRestoreResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                           | Presence | Meaning                                                                                                                       |
| ---------------- | ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `directory`      | `string`                       | Required | Created destination: a clone of the repository detached at commit, without an origin remote, with the side's changes applied. |
| `commit`         | `string`                       | Required | Commit the destination is detached at.                                                                                        |
| `side`           | `"previous" \| "incoming"`     | Required | Side that was restored, copied from the plan.                                                                                 |
| `staging`        | `"unavailable" \| "preserved"` | Required | preserved when the previous side's staged changes were restored to the index; unavailable for incoming.                       |
| `sourceRetained` | `true`                         | Required | Always true: the transfer directory stays in place after restoration.                                                         |

## Signature

```ts
export interface RecoveryRestoreResult {
  readonly directory: string;
  readonly commit: string;
  readonly side: "previous" | "incoming";
  readonly staging: "preserved" | "unavailable";
  readonly sourceRetained: true;
}
```
