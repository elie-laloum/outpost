---
title: "QueueJob"
description: "QueueJob — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueJob } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                                         | Présence  | Rôle                                                                                    |
| ---------- | ------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------- |
| `status`   | `"active" \| "done" \| "failed" \| "cancelled" \| "pending"` | Requis    | État durable du travail : pending, active, done, failed ou cancelled.                   |
| `fence`    | `number`                                                     | Requis    | Génération du bail utilisée pour rejeter les écritures périmées.                        |
| `worker`   | `string \| undefined`                                        | Optionnel | Identité du worker prenant en charge ou possédant le bail du travail.                   |
| `expires`  | `number \| undefined`                                        | Optionnel | Expiration absolue du bail sous forme d’horodatage Unix en millisecondes.               |
| `result`   | `QueueResult \| undefined`                                   | Optionnel | Résultat persisté du worker comprenant valeur JSON, usage optionnel et message d’échec. |
| `id`       | `string`                                                     | Requis    | Identité durable du travail utilisée pour la déduplication et les opérations de bail.   |
| `handler`  | `string`                                                     | Requis    | Nom du gestionnaire enregistré du worker qui exécutera ce travail JSON.                 |
| `input`    | `WorkflowJson`                                               | Requis    | Entrée JSON sans perte fournie au gestionnaire de travail enregistré.                   |
| `deadline` | `number \| undefined`                                        | Optionnel | Échéance absolue du travail sous forme d’horodatage Unix en millisecondes.              |

## Signature

```ts
export interface QueueJob extends QueueRequest {
  readonly status: "pending" | "active" | "done" | "failed" | "cancelled";
  readonly fence: number;
  readonly worker?: string;
  readonly expires?: number;
  readonly result?: QueueResult;
}
```

## Contrats associés

- [QueueRequest](../queuerequest/)
- [QueueResult](../queueresult/)
