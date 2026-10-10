---
title: "Utiliser Redis et BullMQ"
description: "Configurez une file Redis partagée entre producteurs et workers de processus ou de machines différents."
---

## Prérequis

<!-- features -->

- `bullmq` : Un paquet optionnel, installé à côté d’Outpost.
- **Un serveur Redis autonome** : Auto-hébergé ou managé, joignable par chaque producteur et chaque worker.
- **La politique `noeviction`** : Exigée par la file, qui la vérifie à l’ouverture.

Installez BullMQ à côté d’Outpost pour connecter les producteurs et les workers à la file Redis.

```sh
npm install bullmq
```

Utilisez une file Redis dédiée aux producteurs et aux workers qui partagent ces jobs. Configurez sa politique d’éviction avant de connecter BullMQ, afin que Redis ne supprime pas les clés de la file sous la pression mémoire.

Activez la persistance Redis (AOF ou snapshots RDB) si les jobs doivent survivre à un redémarrage de Redis.

## Régler la politique d’éviction

Sur votre propre serveur, réglez la politique et conservez-la après redémarrage :

```sh
redis-cli CONFIG SET maxmemory-policy noeviction
redis-cli CONFIG REWRITE
```

Sur un service managé, modifiez-la dans la console : sur Redis Cloud, réglez **Data eviction policy** de la base sur **No eviction** ; sur Amazon ElastiCache, associez un groupe de paramètres personnalisé où `maxmemory-policy` vaut `noeviction`. Vérifiez ensuite ce que Redis indique :

```sh
redis-cli INFO memory | grep maxmemory_policy
# maxmemory_policy:noeviction
```

`createBullMQTaskQueue()` lit la même ligne `INFO` et refuse toute autre politique, ou un serveur qui la masque. Il ne modifie jamais la configuration du serveur.

:::caution
Les autres politiques peuvent évincer les clés expirables qui portent les baux des workers. Avec `noeviction`, Redis refuse les écritures quand sa mémoire est pleine : surveillez la mémoire et gérez les échecs d’`enqueue()`.
:::

## Configurer la file

Importez l’adaptateur depuis son propre sous-chemin. La file respecte le même contrat que la file SQLite : un worker s’y exécute sans changement ([Files de jobs et workers](../job-queues/)).

```ts title="worker.ts"
import { runQueueWorker } from "@elie-laloum/outpost";
import { createBullMQTaskQueue } from "@elie-laloum/outpost/queues/bullmq";

const queue = await createBullMQTaskQueue({
  name: "code-reviews",
  connection: { host: "127.0.0.1", port: 6379 },
});
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: `reviewer-${process.pid}`,
    signal: stop.signal,
    handlers: { review: (input) => ({ value: input }) },
  });
} finally {
  await queue.close();
}
```

Un producteur ouvre la même file et publie un job pour le traitement `review` :

```ts title="submit.ts"
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

Référence API : [BullMQTaskQueueOptions](../../reference/bullmqtaskqueueoptions/).

## Connecter producteurs et workers

Chaque producteur et chaque worker doit utiliser les mêmes `name`, `prefix`, base Redis et serveur. Une seule différence lui donne, sans erreur, une file séparée et vide.

```ts
import { createBullMQTaskQueue } from "@elie-laloum/outpost/queues/bullmq";

const queue = await createBullMQTaskQueue({
  name: "code-reviews",
  prefix: "outpost",
  connection: {
    host: process.env.REDIS_HOST,
    port: 6379,
    db: 0,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    tls: {},
  },
});
await queue.close();
```

Passez des réglages de connexion, pas un client Redis. Utilisez `prefix` plutôt que `connection.keyPrefix`, que l’adaptateur refuse. Réservez ce préfixe à Outpost : aucun autre consommateur BullMQ ni job de nettoyage ne doit toucher à ses clés.

## Ce que l’adaptateur possède

<!-- features -->

- **Connexions** : Une pour ouvrir la file, puis une file et un worker BullMQ par traitement, ouverts au premier usage.
- **Recherche de baux expirés** : Un minuteur qui remet dans la file les jobs dont le bail a expiré.
- **Fermeture** : `close()` refuse les nouveaux appels, attend ceux en cours, puis ferme chaque connexion.

Les jobs, baux et résultats restent dans Redis après `close()`, pour le processus suivant. Arrêtez le worker avant de fermer : annulez son signal et attendez `runQueueWorker()`, comme dans `worker.ts`.

## Finalisation interrompue

La file enregistre chaque résultat dans son propre état Redis, puis marque le job BullMQ comme terminé. Ce résultat enregistré fait foi :

<!-- features -->

- **La finalisation échoue** : `complete()` réussit quand même, `get()` renvoie le résultat et le job ne s’exécute plus jamais. L’erreur part vers `onError`.
- **`enqueue()` échoue en cours de route** : Renvoyez la même requête avec le même `id` ; la file l’accepte et la publie.
- **Un worker plante** : Son bail expire et un autre worker reprend le job avec la même `idempotencyKey`.

## Renouveler les identifiants Redis

Les réglages de connexion sont lus une seule fois, à l’ouverture de la file. Faites-les tourner en remplaçant les processus :

1. Créez un second utilisateur ACL Redis avec les mêmes permissions.
2. Démarrez les producteurs et workers avec ses identifiants, en gardant les mêmes `name` et `prefix` de file.
3. Arrêtez les anciens workers : annulez leur signal, attendez `runQueueWorker()`, puis fermez leurs connexions à la file.
4. Supprimez l’ancien utilisateur ACL et déconnectez ses clients restants.

Un identifiant révoqué pendant qu’un worker tourne encore lui fait perdre son bail. Un autre worker exécute alors le job de nouveau avec la même `idempotencyKey` : votre service d’effets doit dédupliquer ([Files de jobs et workers](../job-queues/)).

## Limites

- **Redis sans cluster** : Redis Cluster n’est pas pris en charge. Le comportement lors d’une bascule de primaire, avec Sentinel ou un service managé, n’est pas garanti ; testez-le avant de vous y fier.
- **Effets au moins une fois** : Les baux empêchent un worker périmé d’écrire un résultat, pas de répéter un effet externe. Dédupliquez avec `idempotencyKey`.
- **La durabilité est celle de Redis** : Sans persistance, un redémarrage de Redis perd la file.

API : [createBullMQTaskQueue](../../reference/createbullmqtaskqueue/) · [BullMQTaskQueueOptions](../../reference/bullmqtaskqueueoptions/) · [runQueueWorker](../../reference/runqueueworker/).
