---
title: "QueueRequest"
description: "QueueRequest — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueRequest } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                  | Présence  | Rôle                                                                                                                                                                               |
| ---------------- | --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | `string`              | Requis    | Identité durable du travail utilisée pour la déduplication et les opérations de bail.                                                                                              |
| `idempotencyKey` | `string \| undefined` | Optionnel | Clé d’effet transmise au handler à la place de l’identifiant du job ; queuedTask y place la clé d’origine lorsqu’une pause sur quota republie la tâche sous un nouvel identifiant. |
| `handler`        | `string`              | Requis    | Nom du gestionnaire enregistré du worker qui exécutera ce travail JSON.                                                                                                            |
| `input`          | `WorkflowJson`        | Requis    | Entrée JSON sans perte fournie au gestionnaire de travail enregistré.                                                                                                              |
| `deadline`       | `number \| undefined` | Optionnel | Échéance absolue du travail sous forme d’horodatage Unix en millisecondes.                                                                                                         |

## Signature

```ts
export interface QueueRequest {
  readonly id: string;
  /** Stable effect key for handlers when the job id differs, such as after a quota pause. */
  readonly idempotencyKey?: string;
  readonly handler: string;
  readonly input: WorkflowJson;
  readonly deadline?: number;
}
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
