---
title: "createCronSchedule"
description: "createCronSchedule — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createCronSchedule } from "@elie-laloum/outpost";
```

## Purpose and behavior

Parse a five-field cron expression, or a macro such as @daily, evaluated in an IANA time zone (UTC by default). The frozen result computes slots with next() and previous() and publishes nothing. Construction rejects invalid fields, unknown time zones and expressions without any occurrence.

[Complete example and detailed rules](../../guide/cron-schedules/).

## Parameters and properties

| Name               | Type                       | Presence | Meaning                                                                                                                                                                                                                                                                                               |
| ------------------ | -------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `expression`       | `string`                   | Required | Five fields (minute, hour, day of month, month, day of week) with lists, ranges, steps and three-letter month or weekday names, or a macro such as @hourly or @daily; at most 256 characters. Weekday 0 and 7 are Sunday, and when both day fields are restricted, a day matching either one matches. |
| `options`          | `CronOptions \| undefined` | Optional | Evaluation options; omit them to evaluate in UTC.                                                                                                                                                                                                                                                     |
| `options.timeZone` | `string \| undefined`      | Optional | IANA time zone whose wall-clock time the expression describes, such as Europe/Paris; defaults to UTC.                                                                                                                                                                                                 |

## Returns

`CronSchedule`

## Signature

```ts
export declare function createCronSchedule(
  expression: string,
  options?: CronOptions,
): CronSchedule;
```

## Related contracts

- [CronOptions](../cronoptions/)
- [CronSchedule](../cronschedule/)
