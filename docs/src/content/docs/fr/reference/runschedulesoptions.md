---
title: "RunSchedulesOptions"
description: "RunSchedulesOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunSchedulesOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                                                | Présence  | Rôle                                                                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queue`     | `TaskQueue`                                                         | Requis    | File qui reçoit un job de déclencheur par créneau ; partagez-la entre les réplicas du planificateur pour qu’ils convergent vers le même job.                                                               |
| `schedules` | `readonly TriggerSchedule[]`                                        | Requis    | Au moins une planification, chacune avec un nom unique.                                                                                                                                                    |
| `signal`    | `AbortSignal`                                                       | Requis    | Arrête toutes les planifications ; runSchedules() se résout alors.                                                                                                                                         |
| `maxLateMs` | `number \| undefined`                                               | Optionnel | Délai maximal après un créneau pour qu’il soit encore publié, y compris au démarrage ; 60000 par défaut. Les créneaux plus anciens sont ignorés.                                                           |
| `onError`   | `((error: unknown, failure: ScheduleFailure) => void) \| undefined` | Optionnel | Reçoit chaque échec de publication avec sa planification et son créneau, et la planification continue ; sans lui, le premier échec rejette runSchedules(). Les erreurs levées par le rappel sont ignorées. |

## Signature

```ts
export interface RunSchedulesOptions {
  readonly queue: TaskQueue;
  readonly schedules: readonly TriggerSchedule[];
  readonly signal: AbortSignal;
  /** Latest publication accepted for a slot, including after a restart; defaults to 60 seconds. */
  readonly maxLateMs?: number;
  /** Receives publication failures; without it, the first failure rejects `runSchedules()`. */
  readonly onError?: (error: unknown, failure: ScheduleFailure) => void;
}
```

## Contrats associés

- [ScheduleFailure](../schedulefailure/)
- [TaskQueue](../taskqueue/)
- [TriggerSchedule](../triggerschedule/)
