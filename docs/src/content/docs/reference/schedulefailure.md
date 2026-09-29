---
title: "ScheduleFailure"
description: "ScheduleFailure — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ScheduleFailure } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type     | Presence | Meaning                                        |
| ---------- | -------- | -------- | ---------------------------------------------- |
| `schedule` | `string` | Required | Name of the schedule whose publication failed. |
| `slot`     | `Date`   | Required | Slot that could not be published.              |

## Signature

```ts
export interface ScheduleFailure {
  readonly schedule: string;
  readonly slot: Date;
}
```
