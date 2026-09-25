---
title: "WorkflowUsage"
description: "WorkflowUsage — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowUsage } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type     | Présence | Rôle                                                                                    |
| ---------- | -------- | -------- | --------------------------------------------------------------------------------------- |
| `attempts` | `number` | Requis   | Nombre cumulé de tentatives de tâches admises dans le workflow.                         |
| `tokens`   | `Usage`  | Requis   | Usage cumulé de tokens observé sur les tentatives, y compris la comptabilité restaurée. |

## Signature

```ts
export interface WorkflowUsage {
  readonly attempts: number;
  readonly tokens: Usage;
}
```

## Contrats associés

- [Usage](../usage/)
