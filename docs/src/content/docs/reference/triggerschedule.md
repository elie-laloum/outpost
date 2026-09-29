---
title: "TriggerSchedule"
description: "TriggerSchedule — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerSchedule } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                          | Presence | Meaning                                                                                             |
| --------- | --------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                      | Required | Stable name of 1 to 128 letters, digits, dots, underscores or hyphens; part of each job identifier. |
| `cron`    | `CronSchedule`                                | Required | Schedule created with createCronSchedule().                                                         |
| `handler` | `string`                                      | Required | Queue worker handler receiving the jobs, usually a defineWorkflowJob().                             |
| `runId`   | `((slot: Date) => string) \| undefined`       | Optional | Derive the checkpoint run of a slot; defaults to <name>:<slot ISO time>.                            |
| `input`   | `((slot: Date) => WorkflowJson) \| undefined` | Optional | Derive the JSON input of a slot; defaults to null.                                                  |

## Signature

```ts
export interface TriggerSchedule {
  /** Stable name; part of each slot's queue job identifier. */
  readonly name: string;
  readonly cron: CronSchedule;
  readonly handler: string;
  /** Defaults to `<name>:<slot ISO time>`. */
  readonly runId?: (slot: Date) => string;
  /** Defaults to `null`. */
  readonly input?: (slot: Date) => WorkflowJson;
}
```

## Related contracts

- [CronSchedule](../cronschedule/)
- [WorkflowJson](../workflowjson/)
