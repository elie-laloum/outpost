---
title: "WorkflowQuotaPolicy"
description: "WorkflowQuotaPolicy — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowQuotaPolicy } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                                                                                                                                                                                                                   |
| ----------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `action`    | `"pause"`             | Requis    | Comportement face à une erreur de quota ; pause est la seule action prise en charge.                                                                                                                                                                   |
| `maxWaitMs` | `number \| undefined` | Optionnel | Attente maximale en millisecondes d’une réinitialisation future connue dans l’appel start() courant ; une réinitialisation plus lointaine ou inconnue laisse la tâche en pause et le workflow renvoie paused. Entier sûr positif ou nul, 0 par défaut. |

## Signature

```ts
export interface WorkflowQuotaPolicy {
  readonly action: "pause";
  /** Longest in-process wait for a known reset; later resets pause durably. */
  readonly maxWaitMs?: number;
}
```
