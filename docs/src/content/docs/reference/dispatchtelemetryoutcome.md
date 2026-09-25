---
title: "DispatchTelemetryOutcome"
description: "DispatchTelemetryOutcome — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DispatchTelemetryOutcome } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                | Presence | Meaning                                                                                                                   |
| ----------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `status`    | `"done" \| "failed" \| "cancelled"` | Required | done when the dispatch resolves, cancelled for explicit cancellation, or failed for other rejections including deadlines. |
| `usage`     | `Usage`                             | Required | Authoritative result totals on success, or known reconciled consumption on failure.                                       |
| `completed` | `boolean \| undefined`              | Optional | Whether the successful dispatch satisfied its completion condition; absent when the operation rejected.                   |

## Signature

```ts
export interface DispatchTelemetryOutcome {
  readonly status: "done" | "failed" | "cancelled";
  readonly usage: Usage;
  readonly completed?: boolean;
}
```

## Related contracts

- [Usage](../usage/)
