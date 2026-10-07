---
title: "RunTask"
description: "RunTask — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunTask } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                  | Presence | Meaning                                                                                                                                                                                                                       |
| ------------ | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`        | `string`              | Required | Declared workflow task key, including tasks that have not started.                                                                                                                                                            |
| `status`     | `TaskStatus`          | Required | Latest observed workflow task lifecycle state.                                                                                                                                                                                |
| `attempts`   | `number`              | Required | Cumulative attempts reported by the workflow, preserved through settled resumes.                                                                                                                                              |
| `usage`      | `Usage`               | Required | Tokens reported through this task’s workflow context while observed; preserved when resuming the same projection. Restored tasks without prior observed counters carry complete false. Dispatch counters are not added again. |
| `startedAt`  | `string \| undefined` | Optional | Task start time from lifecycle observations or workflow record snapshots.                                                                                                                                                     |
| `finishedAt` | `string \| undefined` | Optional | Last task settlement time from observations or workflow records.                                                                                                                                                              |
| `error`      | `string \| undefined` | Optional | Latest recorded task failure message; filtered by the observation hub’s redaction.                                                                                                                                            |

## Signature

```ts
export interface RunTask {
  readonly key: string;
  readonly status: TaskStatus;
  readonly attempts: number;
  readonly usage: Usage;
  readonly startedAt?: string;
  readonly finishedAt?: string;
  readonly error?: string;
}
```

## Related contracts

- [TaskStatus](../taskstatus/)
- [Usage](../usage/)
