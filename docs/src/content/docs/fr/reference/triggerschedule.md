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

## Paramètres et propriétés

| Nom       | Type                                          | Présence  | Rôle                                                                                                                                                                                                      |
| --------- | --------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                      | Requis    | Nom stable de 1 à 128 lettres, chiffres, points, tirets bas ou tirets ; il fait partie de chaque identifiant de job.                                                                                      |
| `cron`    | `CronSchedule`                                | Requis    | Planification créée avec createCronSchedule().                                                                                                                                                            |
| `handler` | `string`                                      | Requis    | Handler du worker de file qui reçoit les jobs, généralement un defineWorkflowJob().                                                                                                                       |
| `runId`   | `((slot: Date) => string) \| undefined`       | Optionnel | Dérive l’exécution de checkpoint d’un créneau ; &lt;name>:&lt;heure ISO du créneau> par défaut. Renvoyez la même valeur pour un créneau sur chaque réplica, sinon la file refuse la publication suivante. |
| `input`   | `((slot: Date) => WorkflowJson) \| undefined` | Optionnel | Dérive l’entrée JSON d’un créneau ; null par défaut. Renvoyez la même valeur pour un créneau sur chaque réplica, sinon la file refuse la publication suivante.                                            |

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

## Contrats associés

- [CronSchedule](../cronschedule/)
- [WorkflowJson](../workflowjson/)
