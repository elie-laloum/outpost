---
title: "RecoveryStructureCheck"
description: "RecoveryStructureCheck — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name     | Type               | Presence | Meaning                                                                         |
| -------- | ------------------ | -------- | ------------------------------------------------------------------------------- |
| `path`   | `string`           | Required | Retained transfer entry examined by this verification check.                    |
| `status` | `"pass" \| "fail"` | Required | pass when the checked invariant holds, fail when it does not.                   |
| `code`   | `string`           | Required | Diagnostic code identifying the verified invariant or detected transfer defect. |

## Signature

```ts
export interface RecoveryStructureCheck {
  readonly path: string;
  readonly status: "pass" | "fail";
  readonly code: string;
}
```
