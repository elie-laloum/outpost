---
title: "CronSchedule"
description: "CronSchedule — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CronSchedule } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                    | Presence | Meaning                                                                                                                                   |
| ------------ | ----------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `expression` | `string`                | Required | Normalized expression, with a macro replaced by its five fields.                                                                          |
| `timeZone`   | `string`                | Required | Canonical IANA time zone used for evaluation.                                                                                             |
| `next`       | `(after: Date) => Date` | Required | Return the first slot strictly after the given instant; a time skipped by daylight saving does not occur and a repeated time occurs once. |
| `previous`   | `(at: Date) => Date`    | Required | Return the latest slot at or before the given instant, with the same daylight saving rules as next().                                     |

## Signature

```ts
export interface CronSchedule {
  readonly expression: string;
  readonly timeZone: string;
  /** First occurrence strictly after `after`. */
  next(after: Date): Date;
  /** Latest occurrence at or before `at`. */
  previous(at: Date): Date;
}
```
