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

## Paramètres et propriétés

| Nom          | Type                    | Présence | Rôle                                                                                                                                                             |
| ------------ | ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `expression` | `string`                | Requis   | Expression normalisée, une macro étant remplacée par ses cinq champs.                                                                                            |
| `timeZone`   | `string`                | Requis   | Fuseau horaire IANA canonique utilisé pour l’évaluation.                                                                                                         |
| `next`       | `(after: Date) => Date` | Requis   | Renvoie le premier créneau strictement postérieur à l’instant donné ; une heure sautée par l’heure d’été n’existe pas et une heure répétée n’a lieu qu’une fois. |
| `previous`   | `(at: Date) => Date`    | Requis   | Renvoie le dernier créneau égal ou antérieur à l’instant donné, avec les mêmes règles d’heure d’été que next().                                                  |

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
