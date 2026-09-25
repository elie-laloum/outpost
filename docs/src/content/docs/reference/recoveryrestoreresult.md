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

| Name             | Type                           | Presence | Meaning                                                                                                    |
| ---------------- | ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------- |
| `directory`      | `string`                       | Required | New checkout directory populated with the restored state.                                                  |
| `commit`         | `string`                       | Required | Git commit used to reconstruct the selected retained state.                                                |
| `side`           | `"previous" \| "incoming"`     | Required | Retained state to restore: previous host state or incoming remote state.                                   |
| `staging`        | `"unavailable" \| "preserved"` | Required | Whether the original Git index is preserved; incoming remote state has no recoverable staging information. |
| `sourceRetained` | `true`                         | Required | Always true: restoration preserves the original recovery artifacts.                                        |

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
