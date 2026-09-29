---
title: "runSchedules"
description: "runSchedules — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { runSchedules } from "@elie-laloum/outpost";
```

## Rôle et comportement

Publie un job de déclencheur par créneau cron de chaque planification jusqu’à l’interruption de signal, puis se résout. Chaque créneau publie schedule:&lt;name>:&lt;heure ISO du créneau>, si bien que les réplicas et les redémarrages qui partagent une file convergent vers un seul job ; au démarrage ou après un retard, seul le dernier créneau dans maxLateMs est publié. Des options invalides rejettent, et sans onError le premier échec de publication arrête toutes les planifications et rejette.

[Exemple complet et règles détaillées](../../guide/cron-schedules/).

## Paramètres et propriétés

| Nom                 | Type                                                                | Présence  | Rôle                                                                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`           | `RunSchedulesOptions`                                               | Requis    | File, planifications, signal d’arrêt et politique de retard.                                                                                                                                                                                     |
| `options.queue`     | `TaskQueue`                                                         | Requis    | File qui reçoit un job de déclencheur par créneau ; partagez-la entre les réplicas du planificateur pour qu’ils convergent vers le même job.                                                                                                     |
| `options.schedules` | `readonly TriggerSchedule[]`                                        | Requis    | Au moins une planification, chacune avec un nom unique.                                                                                                                                                                                          |
| `options.signal`    | `AbortSignal`                                                       | Requis    | Arrête toutes les planifications ; runSchedules() se résout alors.                                                                                                                                                                               |
| `options.maxLateMs` | `number \| undefined`                                               | Optionnel | Retard maximal après un créneau pour qu’il soit encore publié, y compris au démarrage ; 60000 par défaut. Seul le dernier créneau de cette fenêtre est publié ; une valeur négative ou non entière rejette.                                      |
| `options.onError`   | `((error: unknown, failure: ScheduleFailure) => void) \| undefined` | Optionnel | Reçoit chaque échec de publication avec sa planification et son créneau, et la planification continue ; sans lui, le premier échec arrête toutes les planifications et rejette runSchedules(). Les erreurs levées par le callback sont ignorées. |

## Retour

`Promise<void>`

## Signature

```ts
export declare function runSchedules(
  options: RunSchedulesOptions,
): Promise<void>;
```

## Contrats associés

- [RunSchedulesOptions](../runschedulesoptions/)
