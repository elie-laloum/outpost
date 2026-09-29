---
title: "CronOptions"
description: "CronOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CronOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                  | Presence | Meaning                                                                                               |
| ---------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `timeZone` | `string \| undefined` | Optional | IANA time zone whose wall-clock time the expression describes, such as Europe/Paris; defaults to UTC. |

## Signature

```ts
export interface CronOptions {
  /** IANA time zone evaluating the expression; defaults to UTC. */
  readonly timeZone?: string;
}
```
