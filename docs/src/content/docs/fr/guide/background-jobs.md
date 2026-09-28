---
title: "Travaux en arrière-plan"
description: "Exécuter des handlers enregistrés via une file persistante."
---

Une file déplace des requêtes JSON entre producteurs et workers. Les workers exécutent des handlers enregistrés ; une requête nomme un handler au lieu de fournir du code exécutable arbitraire.

## Démarrer un worker

Créez d’abord `.outpost`, puis lancez le worker dans son propre processus.

```ts
import { sqliteTaskQueue, runQueueWorker } from "@elie-laloum/outpost";

const queue = await sqliteTaskQueue(".outpost/jobs.sqlite");
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
  await queue.close();
}
```

## Soumettre du travail

Un producteur ouvre la même file et appelle `enqueue({ id, handler: "count", input: [1, 2, 3] })`. Utilisez des identifiants stables pour la déduplication et lisez les résultats conservés via le contrat de file. `queuedTask()` enveloppe soumission et attente dans un nœud de workflow et valide la valeur renvoyée avec `decode`.

```ts title="submit.mts"
import { sqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await sqliteTaskQueue(".outpost/jobs.sqlite");
try {
  await queue.enqueue({ id: "count-42", handler: "count", input: [1, 2, 3] });
  console.log(await queue.get("count-42"));
} finally {
  await queue.close();
}
```

## Baux et reprises

Les workers acquièrent des baux protégés contre les anciens propriétaires, les renouvellent et rapportent les résultats. Un bail périmé ne peut pas finaliser le travail de son remplaçant. Une interruption peut néanmoins répéter les effets externes : les handlers doivent être idempotents ou dédupliquer eux-mêmes leurs effets.

Utilisez `serveTaskQueue()` et `httpTaskQueue()` pour exposer une file entre processus via HTTP, avec le jeton configuré et une frontière de transport fiable. Utilisez les [workers Redis](../redis-workers/) pour BullMQ. Transmettez annulation et délais aux opérations des handlers.

API : [sqliteTaskQueue](../../reference/sqlitetaskqueue/) · [runQueueWorker](../../reference/runqueueworker/) · [queuedTask](../../reference/queuedtask/) · [TaskQueue](../../reference/taskqueue/).

## Dédupliquer les effets

Disponible en 7.0.0 : chaque `TaskContext` expose `idempotencyKey`, dérivée de l’exécution du workflow et de la clé de tâche. Elle reste stable lors des retries et reprises de checkpoint ; une nouvelle exécution reçoit une nouvelle clé. Chaque `QueueHandlerContext` distant expose l’identifiant du job sous cette même propriété. `queuedTask()` conserve son calcul d’identifiant existant. Les producteurs directs doivent choisir des identifiants uniques pour les opérations distinctes et éviter les collisions entre files partageant un service d’effets.

Transmettez cette clé au service réalisant l’effet. En base de données, enregistrez le reçu et la modification métier dans la même transaction avec une contrainte d’unicité. Pour une API distante, utilisez son mécanisme d’idempotence persistante. Un ensemble en mémoire ou un reçu écrit séparément de l’effet laisse une fenêtre de crash.

```ts
import type { QueueHandler, WorkflowJson } from "@elie-laloum/outpost";

function deliveryHandler(
  deliverOnce: (
    key: string,
    input: WorkflowJson,
    signal: AbortSignal,
  ) => Promise<WorkflowJson>,
): QueueHandler {
  return async (input, { idempotencyKey, signal }) => ({
    value: await deliverOnce(idempotencyKey, input, signal),
  });
}
```

`deliverOnce` doit dédupliquer atomiquement et conserver son résultat au moins pendant la période de rejeu. Si un handler réalise plusieurs effets, dérivez une clé par opération. Le fencing bloque les écritures périmées dans la file ; il n’empêche pas un service externe d’accepter la requête d’un ancien worker. La rétention des jobs et reçus doit couvrir votre fenêtre de reprise. Ne supprimez jamais des reçus pour forcer un retry sans vérifier les effets précédents.

## Faire tourner les identifiants HTTP

Les endpoints HTTP conservent les jetons fixes existants. Un callback serveur fournit les jetons acceptés à chaque requête ; un callback client fournit son jeton courant, y compris pour les heartbeats et finalisations.

```ts
import { serveTaskQueue, httpTaskQueue } from "@elie-laloum/outpost";
import type { TaskQueue } from "@elie-laloum/outpost";

async function connectRotatingQueue(
  queue: TaskQueue,
  acceptedTokens: () => Promise<readonly string[]>,
  currentToken: () => Promise<string>,
) {
  const server = await serveTaskQueue({ queue, token: acceptedTokens });
  const client = httpTaskQueue({ url: server.url, token: currentToken });
  return { server, client };
}
```

L’appelant ferme séparément `server` et la file sous-jacente. Publiez les deux jetons côté serveur, actualisez tous les clients, vérifiez les renouvellements avec le nouveau jeton, puis retirez l’ancien. Une source serveur vide ou en échec refuse l’accès. Chargez les identifiants depuis un cache de secrets applicatif borné ; les callbacks doivent répondre rapidement. Les jetons autorisent toutes les opérations de la file, sans permissions par worker. Utilisez une terminaison TLS et un réseau privé pour les échanges distants ; ne placez jamais les jetons dans les URL ou les logs. Une révocation peut interrompre un worker à son prochain heartbeat : conservez les reçus d’idempotence avant de le remplacer.

## Exploiter les workers

Utilisez un nom de worker unique par processus et déployez des versions compatibles des handlers avant que les producteurs soumettent leurs jobs. Surveillez l’ancienneté des jobs, les échecs, les erreurs de renouvellement et la capacité du stockage. Synchronisez les horloges des approbateurs pour l’expiration des preuves.

Pour un arrêt planifié, arrêtez les producteurs, laissez les jobs se terminer, puis annulez le signal du worker et attendez `runQueueWorker()` avant de fermer sa file. Une annulation pendant un handler l’interrompt de manière coopérative et rend le travail inachevé récupérable après expiration du bail ; les handlers doivent transmettre le signal. Cette API ne fournit pas de commande de drainage séparée.

Après un crash, confirmez d’abord l’arrêt de l’ancien processus. Attendez l’expiration du bail, démarrez un remplaçant et inspectez résultat conservé et reçus d’effets. Récupérez un checkpoint abandonné uniquement par la procédure explicite, puis autorisez `resume: "retry-incomplete"` si nécessaire. Ne déduisez pas l’arrêt d’un processus distant de son PID. Consultez les [exécutions durables](../durable-runs/) et les [workers Redis](../redis-workers/) pour la propriété et la reprise propres aux backends.
