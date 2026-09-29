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

| Nom              | Type                                                         | Présence  | Rôle                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`         | `"failed" \| "active" \| "done" \| "cancelled" \| "pending"` | Requis    | pending avant la prise en charge, active pendant le bail, puis done, failed ou cancelled. La file ne relance jamais un job failed.                                                       |
| `fence`          | `number`                                                     | Requis    | Génération du bail : 0 à l’envoi, incrémentée à chaque prise en charge, annulation et expiration de deadline. renew() et complete() doivent présenter la valeur courante.                |
| `worker`         | `string \| undefined`                                        | Optionnel | Nom du dernier worker ayant pris le job en charge.                                                                                                                                       |
| `expires`        | `number \| undefined`                                        | Optionnel | Expiration du bail en millisecondes epoch ; une fois passée, un autre worker peut prendre le job en charge.                                                                              |
| `result`         | `QueueResult \| undefined`                                   | Optionnel | Résultat enregistré par complete(), présent dès que le job est done ou failed.                                                                                                           |
| `id`             | `string`                                                     | Requis    | Identifiant du job, de 1 à 512 caractères et unique dans la file ; le renvoyer rend le job stocké.                                                                                       |
| `idempotencyKey` | `string \| undefined`                                        | Optionnel | Clé d’effet transmise au handler à la place de l’identifiant du job ; defineQueuedTask y place la clé d’origine lorsqu’une pause sur quota republie la tâche sous un nouvel identifiant. |
| `handler`        | `string`                                                     | Requis    | Nom du handler de worker qui exécute le job, de 1 à 512 caractères.                                                                                                                      |
| `input`          | `WorkflowJson`                                               | Requis    | Entrée JSON transmise au handler, 262144 octets au plus une fois sérialisée.                                                                                                             |
| `deadline`       | `number \| undefined`                                        | Optionnel | Instant en millisecondes epoch après lequel un job pending ou active devient cancelled ; les baux ne le dépassent jamais.                                                                |

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
