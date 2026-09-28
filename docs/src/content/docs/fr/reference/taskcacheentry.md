---
title: "TaskCacheEntry"
description: "TaskCacheEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskCacheEntry } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                      | Présence | Rôle                                                                                                                                                                    |
| ------------- | ------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`      | `1`                       | Requis   | Version de ce format d’entrée sérialisé ; actuellement 1.                                                                                                               |
| `fingerprint` | `string`                  | Requis   | Empreinte SHA-256 hexadécimale du nom du workflow, de la clé de tâche, de la version du cache et de la clé canonique ; une entrée dont l’empreinte diffère est refusée. |
| `workflow`    | `string`                  | Requis   | Nom du workflow qui a enregistré l’entrée.                                                                                                                              |
| `task`        | `string`                  | Requis   | Clé de la tâche dont l’entrée contient le résultat.                                                                                                                     |
| `version`     | `string`                  | Requis   | Version du cache déclarée par la tâche lors de l’enregistrement de l’entrée.                                                                                            |
| `createdAt`   | `string`                  | Requis   | Horodatage ISO de l’enregistrement du résultat ; comparé à maxAgeMs.                                                                                                    |
| `value`       | `WorkflowCheckpointValue` | Requis   | Résultat de tâche enregistré : JSON sans perte ou undefined au premier niveau.                                                                                          |

## Signature

```ts
export interface TaskCacheEntry {
  readonly format: 1;
  readonly fingerprint: string;
  readonly workflow: string;
  readonly task: string;
  readonly version: string;
  readonly createdAt: string;
  readonly value: WorkflowCheckpointValue;
}
```

## Contrats associés

- [WorkflowCheckpointValue](../workflowcheckpointvalue/)
