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

| Nom              | Type                  | Présence  | Rôle                                                                                                                                                                                     |
| ---------------- | --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | `string`              | Requis    | Identifiant du job, de 1 à 512 caractères et unique dans la file ; le renvoyer rend le job stocké.                                                                                       |
| `idempotencyKey` | `string \| undefined` | Optionnel | Clé d’effet transmise au handler à la place de l’identifiant du job ; defineQueuedTask y place la clé d’origine lorsqu’une pause sur quota republie la tâche sous un nouvel identifiant. |
| `handler`        | `string`              | Requis    | Nom du handler de worker qui exécute le job, de 1 à 512 caractères.                                                                                                                      |
| `input`          | `WorkflowJson`        | Requis    | Entrée JSON transmise au handler, 262144 octets au plus une fois sérialisée.                                                                                                             |
| `deadline`       | `number \| undefined` | Optionnel | Instant en millisecondes epoch après lequel un job pending ou active devient cancelled ; les baux ne le dépassent jamais.                                                                |

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
