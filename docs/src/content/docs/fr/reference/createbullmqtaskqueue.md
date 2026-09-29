---
title: "createBullMQTaskQueue"
description: "createBullMQTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createBullMQTaskQueue } from "@elie-laloum/outpost/queues/bullmq";
```

## Rôle et comportement

Ouvre une TaskQueue sur Redis standalone via BullMQ 5 ; importez-la depuis @elie-laloum/outpost/queues/bullmq et installez bullmq séparément. Refuse un serveur dont maxmemory-policy n’est pas noeviction, sans modifier sa configuration. La file possède ses connexions Redis : arrêtez les workers, puis attendez close().

[Exemple complet et règles détaillées](../../guide/redis-workers/).

## Paramètres et propriétés

| Nom                         | Type                                    | Présence  | Rôle                                                                                                                                                                                                          |
| --------------------------- | --------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                   | `BullMQTaskQueueOptions`                | Requis    | Connexion Redis et espace de noms stable partagé par les producteurs et workers.                                                                                                                              |
| `options.name`              | `string`                                | Requis    | Nom logique commun aux clients ; haché en interne, il accepte les deux-points et Unicode. Des noms différents isolent les identités des jobs.                                                                 |
| `options.connection`        | `RedisOptions`                          | Requis    | RedisOptions pour Redis standalone (host, port, db, username, password, tls), pas un client connecté. Les délais de connexion et de commande valent 10000 par défaut ; keyPrefix est refusé, utilisez prefix. |
| `options.prefix`            | `string \| undefined`                   | Optionnel | Préfixe des clés Redis, outpost par défaut. Le conserver au redémarrage et sur tous les clients ; réserver cet espace sans consommateurs BullMQ externes ni nettoyage tiers.                                  |
| `options.stalledIntervalMs` | `number \| undefined`                   | Optionnel | Intervalle positif en millisecondes entre les contrôles BullMQ des jobs bloqués, 1000 par défaut. La reprise après expiration peut nécessiter deux contrôles ; distinct de leaseMs et pollMs.                 |
| `options.onError`           | `((error: Error) => void) \| undefined` | Optionnel | Observateur synchrone des erreurs de connexion, de contrôle des jobs bloqués et de finalisation BullMQ ; ses exceptions sont ignorées. Les opérations de file rejettent toujours leurs propres échecs.        |

## Retour

`Promise<BullMQTaskQueue>`

## Signature

```ts
export declare function createBullMQTaskQueue(
  options: BullMQTaskQueueOptions,
): Promise<BullMQTaskQueue>;
```

## Contrats associés

- [BullMQTaskQueue](../type-bullmqtaskqueue/)
- [BullMQTaskQueueOptions](../bullmqtaskqueueoptions/)
