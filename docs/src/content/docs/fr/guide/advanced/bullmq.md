---
title: Exécuter une tâche avec BullMQ et Redis
description: Utiliser l’adaptateur BullMQ optionnel avec les contrats de workers et workflows Outpost existants.
---

L’adaptateur optionnel `bullmqTaskQueue` relie `queuedTask` et `runQueueWorker` directement à Redis standalone. SQLite et le coordinateur HTTP restent disponibles. Cet ajout est implémenté mais **non publié** ; utiliser un package construit depuis ce checkout jusqu’à sa publication.

<details>
<summary>Préparer cet exemple depuis zéro</summary>

Utiliser Node.js **24+**, npm et Docker. Aucun compte de modèle ni credential d’agent n’est nécessaire. Dans le checkout source Outpost, construire et empaqueter la bibliothèque :

```sh
npm ci
npm run build
npm pack
```

Créer un répertoire de démonstration distinct. Remplacer le chemin d’archive ci-dessous par le chemin absolu affiché par `npm pack` :

```sh
mkdir outpost-redis-example
cd outpost-redis-example
npm init -y
npm install /absolute/path/to/package.tgz 'bullmq@^5.81.5'
docker run -d --name outpost-redis-demo \
  -p 127.0.0.1:6379:6379 -v outpost-redis-demo:/data \
  redis:7-alpine redis-server --appendonly yes --maxmemory-policy noeviction
```

Cette instance Redis n’est accessible que sur la boucle locale. Son volume nommé conserve les données. Enregistrer le fichier suivant sous **example.mts** dans le répertoire de démonstration.

</details>

## Essayer

```ts file=example.mts
import assert from "node:assert/strict";
import { bullmqTaskQueue } from "@elie-laloum/outpost/queues/bullmq";
import { queuedTask, runQueueWorker, workflow } from "@elie-laloum/outpost";

const queue = await bullmqTaskQueue({
  name: "calculations",
  connection: { host: "127.0.0.1", port: 6379 },
  onError: (error) => console.error(error.message),
});
const stop = new AbortController();
const worker = runQueueWorker({
  queue,
  worker: "calculator-1",
  signal: stop.signal,
  handlers: {
    double(input) {
      if (typeof input !== "number") throw new Error("Expected a number");
      return { value: input * 2 };
    },
  },
});
try {
  const calculate = queuedTask({
    key: "double",
    queue,
    handler: "double",
    input: () => 21,
    decode(value) {
      if (typeof value !== "number") throw new Error("Expected a number");
      return value;
    },
  });
  const result = await workflow("redis-calculation", [calculate]).start({
    signal: AbortSignal.timeout(10_000),
  });
  result.unwrap();
  assert.equal(result.value(calculate), 42);
  console.log(result.value(calculate));
} finally {
  stop.abort();
  try {
    await worker;
  } finally {
    await queue.close();
  }
}
```

```sh
node example.mts
```

## Comprendre le résultat

Le worker affiche `42`. L’exemple arrête le worker avant d’attendre `queue.close()`, qui ferme les connexions de l’adaptateur sans supprimer les enregistrements. Pour séparer producteur et worker, ouvrir un adaptateur dans chaque processus avec les mêmes `name`, `prefix` et paramètres de base Redis. Enregistrer des handlers de confiance sur les workers ; aucun code exécutable ni credential ne transite dans la file. Conserver le contrôleur d’arrêt et la séquence de fermeture du worker dans son propre processus.

Chaque handler utilise une file BullMQ interne distincte. L’adaptateur alterne les handlers demandés et ne confie jamais un handler non pris en charge à un worker. Il ne garantit pas d’ordre FIFO global entre handlers. Arrêter Redis avec `docker stop outpost-redis-demo` ; le relancer avec `docker start outpost-redis-demo`. Le volume et les jobs conservés restent présents jusqu’à leur suppression explicite.

## Propriété et récupération

- Les identifiants sont uniques dans la file logique, même entre handlers différents. Réinsérer la même requête retourne son état existant ; une entrée, un handler ou une échéance différents sont refusés. Les identifiants pris en charge, dont les deux-points et Unicode, sont encodés en interne.
- Les baux utilisent l’horloge du serveur Redis. Les transitions atomiques vérifient le worker, la génération de propriété, l’expiration et le verrou BullMQ natif. Le renouvellement prolonge ce verrou. Annulation et échéances refusent les renouvellements et résultats ultérieurs de l’ancien propriétaire ; les handlers doivent toujours respecter leur signal d’arrêt.
- Les contrôles BullMQ de jobs bloqués récupèrent les claims natifs abandonnés. `stalledIntervalMs` vaut 1000 par défaut ; la reprise peut nécessiter deux contrôles après expiration du verrou. Une interruption avant l’enregistrement du claim Outpost peut laisser le verrou BullMQ initial de 30 secondes. Une erreur terminale de handler ne déclenche pas de retry automatique ; une nouvelle exécution de workflow crée un nouveau job logique.
- Requêtes et résultats conservent leur encodage JSON initial ; Lua ne décode ni ne réencode les valeurs applicatives. Les tableaux et objets vides ainsi que la précision numérique JavaScript sont préservés.
- L’insertion réserve l’identité avant de publier le job BullMQ. Si la publication échoue ou si son accusé de réception est perdu, réessayer **la même requête** pour terminer l’admission ; `get()` seul ne republie pas une admission inachevée. Une erreur d’insertion ne prouve pas que la tâche n’a jamais été acceptée.
- La complétion enregistre le résultat Outpost avant de finaliser le job BullMQ. Si la finalisation native échoue, `get()` retourne toujours le résultat durable ; les claims suivants finalisent ce job sans réexécuter le handler. L’état BullMQ natif peut temporairement être en retard sur celui d’Outpost, y compris pour une annulation. `onError` observe les erreurs de fond et de finalisation ; ses exceptions ne modifient pas le résultat.

Les effets externes restent exécutés **au moins une fois**. Utiliser `job.id` comme clé d’idempotence. Conserver les [règles existantes de retry, de consommation et d’annulation](../../behavior/workflows/distributed/). Attendre `close()` après l’arrêt des workers ; il refuse les nouvelles opérations, attend celles admises et conserve les baux actifs pour la reprise. Il n’annule pas les handlers et ne supprime pas les jobs.

## Exploiter Redis explicitement

Installer BullMQ 5 séparément ; importer le package Outpost de base ne le charge pas. L’adaptateur accepte les `RedisOptions` BullMQ pour une connexion standalone, dont `username`, `password`, `db` et `tls`. Fournir les credentials par variables d’environnement ou gestionnaire de secrets. Les connexions appartiennent à l’adaptateur. Les commandes utilisent `maxRetriesPerRequest: 1` ; les workers BullMQ internes utilisent `null`. Par défaut, les délais de connexion et de commande valent 10 secondes, avec trois tentatives de reconnexion espacées de 100, 200 et 300 ms. Vos options peuvent remplacer ces paramètres. Après épuisement des tentatives, rouvrir l’adaptateur ; configurer les délais et retries selon votre déploiement. Les échecs des opérations rejettent et arrêtent `runQueueWorker` ; superviser les processus workers.

Configurer persistance, sauvegardes et `maxmemory-policy noeviction` ; la durabilité dépend de ces paramètres et de la réplication/bascule Redis. TLS et contrôles d’accès relèvent du déploiement. Ce premier adaptateur cible Redis standalone ; Redis Cluster n’est ni pris en charge ni validé. Les tests utilisent Redis réel sans appels payants de modèles ; ils n’établissent pas de garanties de bascule en production.

Utiliser un `prefix` dédié (`outpost` par défaut) et un `name` stable. Ne pas connecter de processeurs BullMQ ordinaires, relancer manuellement des jobs, activer la suppression automatique ou supprimer des clés BullMQ/Outpost de cet espace. Les files natives et l’état Outpost préservent ensemble identité, générations et historique terminal. Aucune rétention automatique n’est fournie : supprimer un espace entier uniquement lorsque ses workflows ne peuvent plus reprendre et que tous ses clients sont arrêtés.

Voir [bullmqTaskQueue](../../../reference/bullmqtaskqueue/), [BullMQTaskQueueOptions](../../../reference/bullmqtaskqueueoptions/) et la [documentation du traitement manuel BullMQ](https://docs.bullmq.io/patterns/manually-fetching-jobs).
