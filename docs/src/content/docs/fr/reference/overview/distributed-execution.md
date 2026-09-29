---
title: "Exécution distribuée — Vue d’ensemble"
description: "Confiez des jobs à des processus workers via une file durable, avec baux protégés, clés d’idempotence et tâches de workflow typées."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Choisir un backend

Chaque backend implémente `TaskQueue` : `runQueueWorker()`, `defineQueuedTask()` et [defineWorkflowJob()](../../defineworkflowjob/) fonctionnent sans changement sur chacun.

| Backend      | Création                                                                                  | À utiliser pour                                                                                       | Fermeture                                       |
| ------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| SQLite       | `createSqliteTaskQueue(path)`                                                             | Producteurs et workers d’une même machine partageant un fichier de base                               | `queue.close()`                                 |
| HTTP         | `serveTaskQueue({ queue, token })`, puis `createHttpTaskQueue({ url, token })`            | Clients sur d’autres machines ; les jetons bearer peuvent tourner, lus à chaque requête               | `await server.close()`, puis la file            |
| BullMQ/Redis | `createBullMQTaskQueue({ name, connection })` depuis `@elie-laloum/outpost/queues/bullmq` | Workers répartis sur plusieurs machines autour d’un Redis standalone en `maxmemory-policy noeviction` | `await queue.close()` après l’arrêt des workers |

:::caution
Le serveur HTTP n’a pas de TLS et un jeton donne accès à toutes les opérations de la file. Servez-le derrière TLS sur un réseau privé.
:::

## Parcours d’un job

Chaque prise en charge incrémente le `fence` du job ; `renew()` et `complete()` ne réussissent qu’avec le fence courant et un bail non expiré.

| Événement                                     | Job                                                                                             |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `enqueue()` avec un nouvel identifiant        | `pending`, fence 0                                                                              |
| `enqueue()` avec un identifiant existant      | Même requête : le job stocké, quel que soit son statut ; requête différente : refusée           |
| Un worker le prend en charge                  | `active`, fence + 1, bail de `leaseMs` (30000 par défaut), renouvelé à chaque tiers de sa durée |
| Le bail expire (worker tombé)                 | Un autre worker le prend avec fence + 1 ; les écritures de l’ancien worker sont refusées        |
| Le handler se termine sans `error`            | `done`                                                                                          |
| Le handler lève une erreur ou renvoie `error` | `failed` ; la file ne le relance jamais                                                         |
| `cancel(id, fence)` ou `deadline` dépassée    | `cancelled`, fence + 1 ; le signal du handler en cours s’interrompt au renouvellement suivant   |

:::caution
Le fencing refuse les écritures périmées, pas les effets répétés : un job repris exécute à nouveau son handler. Dédupliquez les effets externes avec `QueueHandlerContext.idempotencyKey`.
:::

## Points d’entrée

Guide : [Files de jobs et workers](../../../guide/job-queues/) · [Redis et BullMQ](../../../guide/redis-workers/)

- [createSqliteTaskQueue](../../createsqlitetaskqueue/)
- [createBullMQTaskQueue](../../createbullmqtaskqueue/)
- [serveTaskQueue](../../servetaskqueue/)
- [createHttpTaskQueue](../../createhttptaskqueue/)
- [runQueueWorker](../../runqueueworker/)
- [defineQueuedTask](../../definequeuedtask/)
- [TaskQueue](../../taskqueue/)
- [QueueJob](../../queuejob/)
- [QueueHandlerContext](../../queuehandlercontext/)
- [QueueWorkerOptions](../../queueworkeroptions/)
- [BullMQTaskQueueOptions](../../bullmqtaskqueueoptions/)
