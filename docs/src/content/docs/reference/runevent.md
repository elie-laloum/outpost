---
title: "RunEvent"
description: "RunEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type               | Presence | Meaning                                                                                        |
| ---------------- | ------------------ | -------- | ---------------------------------------------------------------------------------------------- |
| `seq`            | `number`           | Required | Persistent published event cursor, monotonically increasing across settled workflow resumes.   |
| `observationSeq` | `number`           | Required | Original hub sequence, which can restart with a new observer session.                          |
| `at`             | `string`           | Required | Observation timestamp from the producing hub.                                                  |
| `source`         | `string`           | Required | Observation source label read from storage.                                                    |
| `scope`          | `ObservationScope` | Required | Validated observation routing scope including task, dispatch, attempt and subagent identities. |
| `event`          | `unknown`          | Required | Persisted redacted event payload; validate this unknown value before inspecting its fields.    |

## Signature

```ts
export interface RunEvent {
  readonly seq: number;
  readonly observationSeq: number;
  readonly at: string;
  readonly source: string;
  readonly scope: ObservationScope;
  readonly event: unknown;
}
```

## Related contracts

- [ObservationScope](../observationscope/)
