---
title: "Redis et BullMQ"
description: "Partager une même file de jobs entre producteurs et workers sur plusieurs machines, avec BullMQ et un serveur Redis standalone."
---

## Prérequis

<!-- features -->

- `bullmq` : Un paquet optionnel, installé à côté d’Outpost.
- **Un serveur Redis standalone** : Auto-hébergé ou managé, joignable par chaque producteur et chaque worker.
- **La politique `noeviction`** : Exigée par la file, qui la vérifie à l’ouverture.

```sh
npm install bullmq
```

La file conserve ses jobs dans Redis. Activez la persistance Redis (AOF ou instantanés RDB) si les jobs doivent survivre à un redémarrage de Redis.

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

```ts title="worker.mts"
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

Un producteur ouvre la même file et publie un job pour le handler `review` :

```ts title="submit.mts"
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

| Option              | Effet                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `name`              | Nom de la file, partagé par producteurs et workers. Deux noms différents ne partagent aucun job.                |
| `connection`        | Réglages de connexion BullMQ : `host`, `port`, `db`, `username`, `password`, `tls`…                             |
| `prefix`            | Préfixe des clés Redis. Par défaut : `outpost`.                                                                 |
| `stalledIntervalMs` | Intervalle entre deux recherches de baux expirés. Par défaut : 1 000. La reprise peut demander deux recherches. |
| `onError`           | Reçoit les erreurs de connexion et les échecs en arrière-plan qu’aucun appel ne signale.                        |

`connection` fixe des délais de connexion et de commande de 10 secondes et trois tentatives de reconnexion ; vos valeurs les remplacent.

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

- **Connexions** : Une pour ouvrir la file, puis une file et un worker BullMQ par handler, ouverts au premier usage.
- **Recherche de baux expirés** : Un minuteur qui remet dans la file les jobs dont le bail a expiré.
- **Fermeture** : `close()` refuse les nouveaux appels, attend ceux en cours, puis ferme chaque connexion.

Les jobs, baux et résultats restent dans Redis après `close()`, pour le processus suivant. Arrêtez le worker avant de fermer : annulez son signal et attendez `runQueueWorker()`, comme dans `worker.mts`.

## Finalisation interrompue

La file enregistre chaque résultat dans son propre état Redis, puis marque le job BullMQ comme terminé. Ce résultat enregistré fait foi :

<!-- features -->

- **La finalisation échoue** : `complete()` réussit quand même, `get()` renvoie le résultat et le job ne s’exécute plus jamais. L’erreur part vers `onError`.
- **`enqueue()` échoue en cours de route** : Renvoyez la même requête avec le même `id` ; la file l’accepte et la publie.
- **Un worker plante** : Son bail expire et un autre worker reprend le job avec la même `idempotencyKey`.

## Faire tourner les identifiants Redis

Les réglages de connexion sont lus une seule fois, à l’ouverture de la file. Faites-les tourner en remplaçant les processus :

<!-- flow -->

1. **Préparer** : Avant tout redémarrage.
   - **Ajouter un second utilisateur ACL** : Avec les mêmes permissions que l’actuel.
     - Redis
2. **Déployer** : Anciens et nouveaux processus partagent la file.
   - **Démarrer les nouveaux processus** : Workers et producteurs avec le nouvel identifiant, les mêmes `name` et `prefix`.
     - `createBullMQTaskQueue()`
3. **Retirer** : Une fois les nouveaux processus démarrés.
   - **Arrêter les anciens workers** : Annuler leur signal, attendre `runQueueWorker()`, puis `close()`.
     - `runQueueWorker()`
   - **Révoquer** : Supprimer l’ancien utilisateur ACL et déconnecter ses clients restants.
     - Redis

Un identifiant révoqué pendant qu’un worker tourne encore lui fait perdre son bail. Un autre worker exécute alors le job de nouveau avec la même `idempotencyKey` : votre service d’effets doit dédupliquer ([Files de jobs et workers](../job-queues/)).

## Limites

- **Redis standalone uniquement** : Redis Cluster n’est pas pris en charge. Le comportement lors d’une bascule de primaire, avec Sentinel ou un service managé, n’est pas garanti ; testez-le avant de vous y fier.
- **Effets au moins une fois** : Les baux empêchent un worker périmé d’écrire un résultat, pas de répéter un effet externe. Dédupliquez avec `idempotencyKey`.
- **La durabilité est celle de Redis** : Sans persistance, un redémarrage de Redis perd la file.

API : [createBullMQTaskQueue](../../reference/createbullmqtaskqueue/) · [BullMQTaskQueueOptions](../../reference/bullmqtaskqueueoptions/) · [runQueueWorker](../../reference/runqueueworker/).
