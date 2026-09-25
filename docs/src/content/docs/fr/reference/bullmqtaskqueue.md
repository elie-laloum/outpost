---
title: "bullmqTaskQueue"
description: "bullmqTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { bullmqTaskQueue } from "@elie-laloum/outpost/queues/bullmq";
```

## Rôle et comportement

Ouvre un adaptateur optionnel BullMQ 5 sur Redis standalone. Implémente TaskQueue pour queuedTask et runQueueWorker, avec identité des requêtes, résultats JSON sans perte et baux atomiques protégés par génération. Possède ses connexions et contrôles de jobs bloqués ; attendre close() après avoir arrêté les workers. La persistance Redis et l’absence d’éviction déterminent la durabilité. Importer depuis @elie-laloum/outpost/queues/bullmq et installer bullmq séparément.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom                         | Type                                    | Présence  | Rôle                                                                                                                                                                                                                                                                                        |
| --------------------------- | --------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                   | `BullMQTaskQueueOptions`                | Requis    | Connexion Redis et espace de noms stable partagé par les producteurs et workers.                                                                                                                                                                                                            |
| `options.name`              | `string`                                | Requis    | Nom logique commun aux clients ; haché en interne, il accepte les deux-points et Unicode. Des noms différents isolent les identités des jobs.                                                                                                                                               |
| `options.connection`        | `RedisOptions`                          | Requis    | RedisOptions BullMQ pour Redis standalone, dont host, port, db, username, password et tls. Fournir des options, pas un client connecté. L’adaptateur possède les connexions et fixe maxRetriesPerRequest à 1 pour les commandes et null pour les workers BullMQ. Ne pas utiliser keyPrefix. |
| `options.prefix`            | `string \| undefined`                   | Optionnel | Préfixe des clés Redis, outpost par défaut. Le conserver au redémarrage et sur tous les clients ; réserver cet espace sans consommateurs BullMQ externes ni nettoyage tiers.                                                                                                                |
| `options.stalledIntervalMs` | `number \| undefined`                   | Optionnel | Intervalle positif en millisecondes entre les contrôles BullMQ des jobs bloqués, 1000 par défaut. La reprise après expiration peut nécessiter deux contrôles ; distinct de leaseMs et pollMs.                                                                                               |
| `options.onError`           | `((error: Error) => void) \| undefined` | Optionnel | Observateur synchrone optionnel des erreurs de connexion, de contrôle des jobs bloqués et de finalisation native. Ses exceptions sont ignorées. Les opérations de queue rejettent toujours leurs échecs ; un résultat enregistré reste la référence si la finalisation native échoue.       |

## Retour

`Promise<BullMQTaskQueue>`

## Signature

```ts
export declare function bullmqTaskQueue(
  options: BullMQTaskQueueOptions,
): Promise<BullMQTaskQueue>;
```

## Contrats associés

- [BullMQTaskQueue](../type-bullmqtaskqueue/)
- [BullMQTaskQueueOptions](../bullmqtaskqueueoptions/)
