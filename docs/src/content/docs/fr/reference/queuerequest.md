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

| Nom        | Type                  | Présence  | Rôle                                                                                  |
| ---------- | --------------------- | --------- | ------------------------------------------------------------------------------------- |
| `id`       | `string`              | Requis    | Identité durable du travail utilisée pour la déduplication et les opérations de bail. |
| `handler`  | `string`              | Requis    | Nom du gestionnaire enregistré du worker qui exécutera ce travail JSON.               |
| `input`    | `WorkflowJson`        | Requis    | Entrée JSON sans perte fournie au gestionnaire de travail enregistré.                 |
| `deadline` | `number \| undefined` | Optionnel | Échéance absolue du travail sous forme d’horodatage Unix en millisecondes.            |

## Signature

```ts
export interface QueueRequest {
  readonly id: string;
  readonly handler: string;
  readonly input: WorkflowJson;
  readonly deadline?: number;
}
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
