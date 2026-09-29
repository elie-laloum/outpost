---
title: "Workers Redis"
description: "Distribuer les travaux avec BullMQ et Redis standalone."
---

Installez `bullmq` et démarrez un serveur Redis standalone. L’adaptateur se charge uniquement via son sous-chemin de paquet optionnel.

Réglez `maxmemory-policy` sur `noeviction` avant d’ouvrir une file. Outpost vérifie Redis INFO et refuse toute autre politique ou une valeur indisponible ; il ne modifie jamais la configuration du serveur. L’éviction des clés expirables peut supprimer les verrous des workers. Sur Redis Cloud, modifiez **Data eviction policy** en **no eviction** dans la console, enregistrez puis vérifiez qu’INFO indique `maxmemory_policy:noeviction`. Lorsque la mémoire est pleine, les écritures échouent au lieu d’évincer l’état de la file ; surveillez la capacité et gérez ces erreurs.

```sh
npm install bullmq
```

```ts
import { createBullMQTaskQueue } from "@elie-laloum/outpost/queues/bullmq";

const queue = await createBullMQTaskQueue({
  name: "code-reviews",
  connection: { host: "127.0.0.1", port: 6379 },
});
try {
  await queue.enqueue({
    id: "review-42",
    handler: "review",
    input: { commit: "abc123" },
  });
} finally {
  await queue.close();
}
```

## Connecter les workers

Utilisez les mêmes `name`, `prefix`, base Redis et destination de connexion pour les producteurs et consommateurs `runQueueWorker()`. `connection` reçoit des réglages, pas un client Redis déjà possédé. L’adaptateur possède ses connexions et les libère à `close()`.

Ne fournissez pas `keyPrefix` ; utilisez l’option `prefix` d’Outpost. Réservez cet espace de noms à l’adaptateur, sans consommateurs BullMQ natifs ni nettoyages externes sans rapport.

## Finalisation interrompue

Les résultats Outpost conservés restent autoritatifs si la finalisation native BullMQ est interrompue. La récupération des jobs bloqués et l’expiration des baux ont des temporalités différentes. La file bloque les écritures périmées mais ne garantit pas des effets externes exactement une fois.

Observez les erreurs de connexion et de finalisation avec `onError`. Les opérations directes rejettent toujours en cas d’échec ; un observateur ne remplace pas la gestion de ces rejets.

API : [createBullMQTaskQueue](../../reference/createbullmqtaskqueue/).

## Faire tourner les identifiants Redis

Les paramètres de connexion sont fixés lorsque `createBullMQTaskQueue()` ouvre ses clients. Introduisez un identifiant ACL Redis de remplacement avec les mêmes permissions requises, déployez les workers/producteurs qui l’utilisent, puis arrêtez les anciens processus et fermez leurs files avant de révoquer l’ancien identifiant. Ne modifiez pas l’objet de connexion d’un adapter actif pour le faire tourner. Les opérateurs Redis gèrent les ACL et la fermeture des connexions authentifiées restantes.

Conservez le même espace de noms lors du remplacement. Une connexion révoquée trop tôt peut perdre son bail ; le successeur reçoit la même `idempotencyKey`, le service d’effets doit donc conserver les reçus de déduplication. Consultez [l’exploitation des workers](../background-jobs/#exploiter-les-workers) pour l’arrêt et la reprise après crash. Les tests de crash avec Redis standalone ne prouvent pas la bascule d’un primaire managé.
