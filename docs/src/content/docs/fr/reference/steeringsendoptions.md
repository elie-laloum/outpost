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

| Nom        | Type                          | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | ----------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subagent` | `string \| null \| undefined` | Optionnel | Identifiant d’exécution d’un sous-agent intégré, lu dans son événement subagent, pour ne remettre qu’à cette exécution à sa prochaine limite d’étape ; null pour ne remettre qu’à la boucle principale. Omettez-le pour remettre à la première boucle active. Les consignes pour une exécution terminée, ou envoyées à des agents CLI, sont rejetées avec le code steering. |

## Signature

```ts
export interface SteeringSendOptions {
  /** Built-in subagent run id from its `subagent` event; `null` targets only the main loop. */
  readonly subagent?: string | null;
}
```
