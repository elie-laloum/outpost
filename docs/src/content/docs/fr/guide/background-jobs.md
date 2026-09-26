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
