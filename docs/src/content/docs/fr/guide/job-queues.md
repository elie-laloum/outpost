---
title: "Exécuter des jobs avec des workers"
description: "Soumettez des jobs à une file et exécutez-les dans des workers avec réservation, reprise et résultats enregistrés."
---

Le premier producteur et son worker fonctionnent sans agent ni compte. Enregistrez `worker.ts` et `submit.ts` ensemble, lancez `node worker.ts` dans un terminal puis `node submit.ts` dans un autre, depuis le même dossier. Consultez le job enregistré après son traitement.

## Parcours d’un job

Les producteurs publient un nom de traitement et une entrée JSON dans une file. Les workers réservent les jobs, exécutent le traitement enregistré et conservent le résultat. Choisissez une file partagée par les producteurs et les workers concernés.

<!-- canvas -->

- **Soumettre**: Le producteur enregistre un job dans la file partagée.
  - Producteur
  - → **Exécuter**: job réservé
- **Exécuter**: Le worker lance le traitement et renouvelle sa réservation.
  - Worker
  - → **Lire**: résultat sauvé
- **Lire**: Le producteur retrouve le résultat ou l’erreur avec l’identifiant du job.
  - Producteur

## Démarrer un worker

Lancez le worker dans son propre processus. Il interroge la file et exécute un job à la fois jusqu’à l’annulation de son signal.

```ts title="worker.ts"
import { createSqliteTaskQueue, runQueueWorker } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "worker-1",
    signal: stop.signal,
    handlers: {
      count: (input) => ({ value: Array.isArray(input) ? input.length : 0 }),
    },
  });
} finally {
  queue.close();
}
```

`createSqliteTaskQueue()` crée le fichier et son répertoire parent. Un traitement renvoie `{ value }`, avec `usage` et `error` en option ; une erreur levée ou un champ `error` fait passer le job en `failed`. Pour travailler en parallèle, lancez plusieurs workers, chacun avec son propre nom `worker`.

## Soumettre du travail

Un producteur ouvre la même file et y ajoute un job sous un identifiant stable.

```ts title="submit.ts"
import { createSqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
try {
  await queue.enqueue({ id: "count-42", handler: "count", input: [1, 2, 3] });
  console.log(await queue.get("count-42"));
  // Example output: { id: "count-42", status: "pending", … }
} finally {
  queue.close();
}
```

<!-- check:run -->

Le script affiche le job avec `status: "pending"` ; une fois qu’un worker l’a exécuté, `result.value` vaut `3`. Remettre en file un identifiant existant avec la même requête renvoie le job existant ; une requête différente sous cet identifiant est refusée. `cancel(id, job.fence)` annule un job en attente ou en cours.

### Consulter le résultat

Après le traitement, lancez `node read-job.ts`. Si le statut reste `pending`, vérifiez que le worker utilise la même base et connaît le traitement `count`. Un job terminé affiche la valeur `3`.

```ts title="read-job.ts"
import { createSqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
try {
  const job = await queue.get("count-42");
  console.log(job?.status, job?.result);
} finally {
  queue.close();
}
```

## Choisir le stockage de la file

| Backend      | Création                                                              | Usage                                               | Fermeture             |
| ------------ | --------------------------------------------------------------------- | --------------------------------------------------- | --------------------- |
| SQLite       | `createSqliteTaskQueue(path)`                                         | Des processus d’une machine partageant un fichier.  | `queue.close()`       |
| HTTP         | `createHttpTaskQueue({ url, token })`                                 | Les clients d’une file servie par `serveTaskQueue`. | Rien à fermer         |
| Redis/BullMQ | `createBullMQTaskQueue()` depuis `@elie-laloum/outpost/queues/bullmq` | Des workers répartis sur plusieurs machines.        | `await queue.close()` |

Le système de stockage BullMQ a sa propre configuration : voir [Redis et BullMQ](../redis-workers/).

## Workspaces de fichiers

Les workers exécutent aussi les recettes de fichiers de configuration 3 via le même runtime. Chaque job possédé reçoit une matérialisation distincte ; les destinations partagées se coordonnent par des verrous communs à l’hôte. Voir [les jobs de fichiers indépendants](../queued-workflows/#exécuter-des-jobs-indépendants).

## Limites

- Les entrées et les valeurs sont du JSON, jusqu’à 256 Kio chacune. Les identifiants et noms de traitements font au plus 512 caractères, un `runId` au plus 256.
- Un worker enregistre au plus 100 traitements.
- Un job échoué garde son résultat. Un `defineQueuedTask()` relancé ou repris retrouve le même job échoué : relancez plutôt dans le traitement.
- Un seul job à la fois par `runId` : un second job pour une exécution encore en cours échoue.
- La file bloque les écritures périmées mais ne garantit pas qu’un effet externe n’ait lieu qu’une fois.
- Un jeton HTTP autorise toutes les opérations de la file. Servez-la derrière TLS sur un réseau privé, et gardez les jetons hors des URL et des logs.

API : [runQueueWorker](../../reference/runqueueworker/) · [createSqliteTaskQueue](../../reference/createsqlitetaskqueue/) · [TaskQueue](../../reference/taskqueue/) · [QueueHandler](../../reference/queuehandler/) · [QueueHandlerContext](../../reference/queuehandlercontext/) · [defineQueuedTask](../../reference/definequeuedtask/) · [defineWorkflowJob](../../reference/defineworkflowjob/) · [serveTaskQueue](../../reference/servetaskqueue/) · [createHttpTaskQueue](../../reference/createhttptaskqueue/).

## Pour continuer

- [Partager la file par HTTP](../http-queues/)

<span id="exposer-une-file-via-http"></span>

## Pour aller plus loin

- [Conserver la progression d’un workflow](../queued-workflows/)
- [Exploiter les workers](../operating-workers/)

<span id="attendre-un-job-dans-un-workflow"></span>
<span id="associer-un-checkpoint-à-chaque-job"></span>
<span id="reprendre-une-exécution"></span>
<span id="approuver-ou-répondre-à-une-exécution-en-pause"></span>

<span id="réservation-des-jobs-et-nouvelles-tentatives"></span>
<span id="dédupliquer-les-effets-avec-les-clés-didempotence"></span>
<span id="exploiter-les-workers"></span>
