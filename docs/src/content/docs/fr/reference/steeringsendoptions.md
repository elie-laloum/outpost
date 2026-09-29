---
title: "SteeringSendOptions"
description: "SteeringSendOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SteeringSendOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                          | Présence  | Rôle                                                                                                                                                                                                                                                                                                   |
| ---------- | ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `subagent` | `string \| null \| undefined` | Optionnel | Identifiant d’exécution d’un sous-agent intégré, lu dans son événement subagent, pour ne remettre la consigne qu’à cette exécution à sa prochaine étape ; null la réserve à la boucle principale. Omis, la première boucle active la reçoit. Les agents CLI rejettent une cible avec le code steering. |

## Signature

```ts
export interface SteeringSendOptions {
  /** Built-in subagent run id from its `subagent` event; `null` targets only the main loop. */
  readonly subagent?: string | null;
}
```
