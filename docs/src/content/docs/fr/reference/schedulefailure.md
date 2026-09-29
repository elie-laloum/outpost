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

## Paramètres et propriétés

| Nom        | Type     | Présence | Rôle                                                  |
| ---------- | -------- | -------- | ----------------------------------------------------- |
| `schedule` | `string` | Requis   | Nom de la planification dont la publication a échoué. |
| `slot`     | `Date`   | Requis   | Créneau qui n’a pas pu être publié.                   |

## Signature

```ts
export interface ScheduleFailure {
  readonly schedule: string;
  readonly slot: Date;
}
```
