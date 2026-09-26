---
title: "Workers Redis"
description: "Distribuer les travaux avec BullMQ et Redis standalone."
---

Installez `bullmq` et démarrez un serveur Redis standalone. L’adaptateur se charge uniquement via son sous-chemin de paquet optionnel.

```sh
npm install bullmq
```

```ts
import { bullmqTaskQueue } from "@elie-laloum/outpost/queues/bullmq";

const queue = await bullmqTaskQueue({
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

API : [bullmqTaskQueue](../../reference/bullmqtaskqueue/).
