---
title: "Exécution distribuée — Vue d’ensemble"
description: "L’exécution distribuée sépare l’admission des tâches du processus qui effectue le travail."
sidebar:
  label: Vue d’ensemble
  order: 0
---

L’exécution distribuée sépare l’admission des tâches du processus qui effectue le travail. Une file durable conserve les jobs ; les workers les réclament et exécutent des handlers enregistrés. Le même modèle peut fonctionner sur une seule machine avant de répartir coordinateur et workers sur plusieurs hôtes.

## Fonctionnement et philosophie

`sqliteTaskQueue` fournit le stockage durable de la file. `serveTaskQueue` et `httpTaskQueue` l’exposent via HTTP ; `runQueueWorker` exécute les handlers. `queuedTask` relie les résultats de la file à un workflow typé. Baux et générations de propriété déterminent quelle prise en charge peut encore rapporter un résultat.

`bullmqTaskQueue` fournit une alternative Redis via l’entrée optionnelle `queues/bullmq`, sans coordinateur HTTP. Choisir SQLite/HTTP pour un coordinateur sur disque local ; choisir BullMQ lorsque Redis est déjà exploité par votre équipe. Les deux utilisent les mêmes handlers et workflows. Voir le [guide BullMQ/Redis](../../../guide/advanced/bullmq/).

## Limites et responsabilités

Le contrôle des générations refuse les résultats périmés mais ne peut pas annuler un effet externe déjà produit. Concevez les handlers pour les retries et les effets au moins une fois. Des hôtes séparés nécessitent un transport protégé et authentifié ; les exemples locaux sur loopback ne configurent pas un réseau ni un système d’identité de production.

## Points d’entrée

- [sqliteTaskQueue](../../sqlitetaskqueue/)
- [bullmqTaskQueue](../../bullmqtaskqueue/)
- [serveTaskQueue](../../servetaskqueue/)
- [httpTaskQueue](../../httptaskqueue/)
- [runQueueWorker](../../runqueueworker/)
- [queuedTask](../../queuedtask/)
- [QueueLease](../../queuelease/)

[Passer à la pratique avec le Guide](../../../guide/advanced/distributed/).
