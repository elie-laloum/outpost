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

Erreur enregistrée quand un usage signalé est marqué incomplet alors que le budget fixe des limites de tokens sans attempts. Elle fait échouer l’exécution et annule les tâches en cours et en attente ; fixez budget.attempts pour garder une limite de repli.

[Exemple complet et règles détaillées](../../guide/budgets/).

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                                                                    |
| ----------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `dimension` | `"usage"`             | Requis    | Toujours usage : la comptabilité des tokens est incomplète et le budget n’a pas de repli en tentatives. |
| `name`      | `string`              | Requis    | Nom d’erreur stable WorkflowUsageUnavailable.                                                           |
| `message`   | `string`              | Requis    | Explication lisible de l’échec.                                                                         |
| `stack`     | `string \| undefined` | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                        |
| `cause`     | `unknown`             | Optionnel | Échec sous-jacent que cette erreur enveloppe ; quotaFault() et unavailableFault() suivent cette chaîne. |

## Signature

```ts
export declare class WorkflowUsageUnavailable extends Error {
  readonly dimension = "usage";
  constructor();
}
```
