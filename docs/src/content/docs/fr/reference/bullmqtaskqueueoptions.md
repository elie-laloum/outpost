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

| Nom                 | Type                                    | Présence  | Rôle                                                                                                                                                                                                                                                                                        |
| ------------------- | --------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`              | `string`                                | Requis    | Nom logique commun aux clients ; haché en interne, il accepte les deux-points et Unicode. Des noms différents isolent les identités des jobs.                                                                                                                                               |
| `connection`        | `RedisOptions`                          | Requis    | RedisOptions BullMQ pour Redis standalone, dont host, port, db, username, password et tls. Fournir des options, pas un client connecté. L’adaptateur possède les connexions et fixe maxRetriesPerRequest à 1 pour les commandes et null pour les workers BullMQ. Ne pas utiliser keyPrefix. |
| `prefix`            | `string \| undefined`                   | Optionnel | Préfixe des clés Redis, outpost par défaut. Le conserver au redémarrage et sur tous les clients ; réserver cet espace sans consommateurs BullMQ externes ni nettoyage tiers.                                                                                                                |
| `stalledIntervalMs` | `number \| undefined`                   | Optionnel | Intervalle positif en millisecondes entre les contrôles BullMQ des jobs bloqués, 1000 par défaut. La reprise après expiration peut nécessiter deux contrôles ; distinct de leaseMs et pollMs.                                                                                               |
| `onError`           | `((error: Error) => void) \| undefined` | Optionnel | Observateur synchrone optionnel des erreurs de connexion, de contrôle des jobs bloqués et de finalisation native. Ses exceptions sont ignorées. Les opérations de queue rejettent toujours leurs échecs ; un résultat enregistré reste la référence si la finalisation native échoue.       |

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
