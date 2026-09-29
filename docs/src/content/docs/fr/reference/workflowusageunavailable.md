---
title: "WorkflowUsageUnavailable"
description: "WorkflowUsageUnavailable — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { WorkflowUsageUnavailable } from "@elie-laloum/outpost";
```

## Rôle et comportement

Erreur signalant qu’une comptabilité incomplète empêche de contrôler un budget de workflow ou de spéculation exclusivement en tokens. Configurez budget.attempts et des délais d’exécution pour autoriser un repli borné. Sa dimension usage annule le travail admis et empêche les retries.

[Exemple complet et règles détaillées](../../guide/budgets/).

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                                                                    |
| ----------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `dimension` | `"usage"`             | Optionnel | Toujours usage : la comptabilité des tokens est incomplète et le budget n’a pas de repli en tentatives. |
| `name`      | `string`              | Requis    | Nom d’erreur stable WorkflowUsageUnavailable.                                                           |
| `message`   | `string`              | Requis    | Explication lisible de l’échec.                                                                         |
| `stack`     | `string \| undefined` | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                        |
| `cause`     | `unknown`             | Optionnel | Échec d’origine attaché à cette erreur.                                                                 |

## Signature

```ts
export declare class WorkflowUsageUnavailable extends Error {
  readonly dimension = "usage";
  constructor();
}
```
