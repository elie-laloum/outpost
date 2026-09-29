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

## Paramètres et propriétés

| Nom        | Type                  | Présence  | Rôle                                                                                                       |
| ---------- | --------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| `timeZone` | `string \| undefined` | Optionnel | Fuseau horaire IANA dont l’heure murale est décrite par l’expression, comme Europe/Paris ; UTC par défaut. |

## Signature

```ts
export interface CronOptions {
  /** IANA time zone evaluating the expression; defaults to UTC. */
  readonly timeZone?: string;
}
```
