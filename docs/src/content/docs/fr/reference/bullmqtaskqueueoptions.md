---
title: "BullMQTaskQueueOptions"
description: "BullMQTaskQueueOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { BullMQTaskQueueOptions } from "@elie-laloum/outpost/queues/bullmq";
```

## Paramètres et propriétés

| Nom                 | Type                                    | Présence  | Rôle                                                                                                                                                                                                          |
| ------------------- | --------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`              | `string`                                | Requis    | Nom logique commun aux clients ; haché en interne, il accepte les deux-points et Unicode. Des noms différents isolent les identités des jobs.                                                                 |
| `connection`        | `RedisOptions`                          | Requis    | RedisOptions pour Redis standalone (host, port, db, username, password, tls), pas un client connecté. Les délais de connexion et de commande valent 10000 par défaut ; keyPrefix est refusé, utilisez prefix. |
| `prefix`            | `string \| undefined`                   | Optionnel | Préfixe des clés Redis, outpost par défaut. Le conserver au redémarrage et sur tous les clients ; réserver cet espace sans consommateurs BullMQ externes ni nettoyage tiers.                                  |
| `stalledIntervalMs` | `number \| undefined`                   | Optionnel | Intervalle positif en millisecondes entre les contrôles BullMQ des jobs bloqués, 1000 par défaut. La reprise après expiration peut nécessiter deux contrôles ; distinct de leaseMs et pollMs.                 |
| `onError`           | `((error: Error) => void) \| undefined` | Optionnel | Observateur synchrone des erreurs de connexion, de contrôle des jobs bloqués et de finalisation BullMQ ; ses exceptions sont ignorées. Les opérations de file rejettent toujours leurs propres échecs.        |

## Signature

```ts
import type { RedisOptions } from "bullmq";

export interface BullMQTaskQueueOptions {
  readonly name: string;
  readonly connection: RedisOptions;
  readonly prefix?: string;
  readonly stalledIntervalMs?: number;
  readonly onError?: (error: Error) => void;
}
```
