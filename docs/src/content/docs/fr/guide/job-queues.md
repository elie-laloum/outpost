---
title: "Exécuter des jobs avec des workers"
description: "Soumettez des jobs à une file et exécutez-les dans des workers avec réservation, reprise et résultats enregistrés."
---

## Parcours d’un job

Les producteurs publient un nom de traitement et une entrée JSON dans une file. Les workers réservent les jobs, exécutent le traitement enregistré et conservent le résultat. Choisissez une file partagée par les producteurs et les workers concernés.

<!-- canvas -->

- **Soumission**: Un producteur ajoute le job.
  - Étapes
  - **Mise en file**: Le job est enregistré en `pending` sous son identifiant.
    - `enqueue()`
  - → **Prise en charge**: puis
- **Prise en charge**: Un worker le récupère.
  - Étapes
  - **Bail**: Le worker réclame un job pour l’un de ses traitements et renouvelle un bail pendant son exécution.
    - `runQueueWorker()`
  - → **Exécution**: puis
- **Exécution**: Le traitement fait le travail.
  - Étapes
  - **Traitement**: Il reçoit l’entrée, un signal d’annulation et une `idempotencyKey`.
    - `QueueHandler`
  - → **Conservation**: puis
- **Conservation**: Le résultat reste dans la file.
  - Étapes
  - **Fin**: Le job passe à `done`, ou à `failed` avec une erreur.
  - **Lecture**: Les producteurs le relisent par son identifiant.
    - `get()`

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
} finally {
  queue.close();
}
```

<!-- check:run -->

Le script affiche le job avec `status: "pending"` ; une fois qu’un worker l’a exécuté, `result.value` vaut `3`. Remettre en file un identifiant existant avec la même requête renvoie le job existant ; une requête différente sous cet identifiant est refusée. `cancel(id, job.fence)` annule un job en attente ou en cours.

### Attendre un job dans un workflow

`defineQueuedTask()` est une tâche de workflow qui met un job en file, l’interroge jusqu’à ce qu’il se termine et valide sa valeur avec `decode`.

```ts
import {
  createSqliteTaskQueue,
  defineQueuedTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const count = defineQueuedTask({
  key: "count",
  queue,
  handler: "count",
  input: () => [1, 2, 3],
  decode: (value) => {
    if (typeof value !== "number") throw new Error("Expected a count");
    return value;
  },
});
const result = await defineWorkflow("count-items", [count]).start();
console.log(result.value(count));
queue.close();
```

L’identifiant du job dérive de l’`executionId` de l’exécution et de la clé de la tâche : une [exécution durable](../durable-runs/) reprise attend donc le même job. Annuler le workflow annule le job. Pour un job arrêté par une limite d’usage, voir [Pauses sur quota](../quota-pauses/).

## Associer un checkpoint à chaque job

`defineWorkflowJob()` transforme un traitement en une [exécution durable](../durable-runs/) par job. L’entrée du job est `{ runId, input }`, ce que publient la [Planification cron](../cron-schedules/) et les [Webhooks](../webhooks/).

```ts title="fix-job.ts"
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineTask,
  defineWorkflow,
  defineWorkflowJob,
} from "@elie-laloum/outpost";

const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
export const fix = defineWorkflowJob({
  checkpoint: { store, version: "1" },
  workflow: (input) =>
    defineWorkflow("fix", [
      defineTask({ key: "report", perform: () => ({ received: input }) }),
    ]),
});
```

Enregistrez-le dans le worker avec `handlers: { fix }`. Pour chaque job, `workflow` construit le graphe à partir de `input` et le démarre sous le `runId` du job ; la même entrée doit construire le même graphe. Passez les autres options de démarrage, comme `concurrency`, `budget`, `onQuota` ou `timeoutMs`, dans `start`.

Le résultat enregistré permet au producteur de consulter le workflow terminé.

Référence API : [QueueHandlerContext](../../reference/queuehandlercontext/).

`result.usage` contient l’usage cumulé des tokens de l’exécution. Une exécution `failed` ou `cancelled` fait échouer le job ; une exécution en pause ou en attente le termine normalement.

:::note
L’empreinte lie un `runId` à une seule entrée. Un job avec le même `runId` et une autre entrée échoue à la vérification d’identité du checkpoint, au lieu de mélanger deux demandes dans une même exécution.
:::

### Reprendre une exécution

Un identifiant de job terminé ne s’exécute plus : le remettre en file renvoie le job enregistré. Pour poursuivre une exécution, mettez en file un nouvel identifiant de job avec le même `runId` et la même entrée.

```ts
import { createSqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const job = await queue.enqueue({
  id: "fix-42-resume-1",
  handler: "fix",
  input: { runId: "fix-42", input: { issue: 42 } },
});
console.log(job.status);
queue.close();
```

<!-- check:run -->

Le script affiche `pending` jusqu’à ce qu’un worker exécute le job. Les tâches `done` proviennent du checkpoint. Les tâches échouées ou interrompues ne sont relancées que si le traitement définit `checkpoint: { store, version: "1", resume: "retry-incomplete" }` : voir [Exécutions durables](../durable-runs/).

### Approuver ou répondre à une exécution en pause

`start` exclut `decisions` et `answers` : soumettez-les depuis votre application. Construisez le même workflow et appelez `workflow.start()` avec `checkpoint: { store, runId, version }` issus de la valeur du job, plus `decisions` ([approbations](../approvals/)) ou `answers` ([tâches interactives](../interactive-tasks/)).

## Réservation des jobs et nouvelles tentatives

Chaque prise en charge incrémente le `fence` du job : un worker qui a perdu son bail ne peut pas écraser le résultat de son successeur.

| Événement                         | Ce qui se passe                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Le traitement s’exécute           | Le bail dure `leaseMs` (30 s par défaut, de 30 ms à 5 min) et se renouvelle tous les tiers de cette durée. |
| Le worker plante                  | Le bail expire ; un autre worker prend le job avec un nouveau jeton de propriété.                          |
| Renouvellement échoué, job annulé | Le `signal` du traitement est annulé et ce worker n’enregistre aucun résultat.                             |
| Le traitement échoue              | Le job passe à `failed`. La file ne le relance pas : mettez en file un nouvel identifiant.                 |
| `deadline` dépassée               | Le job passe à `cancelled`. `deadline` est un horodatage en millisecondes epoch.                           |

Transmettez `signal` à chaque opération lancée par le traitement, pour que l’annulation et la perte du bail l’arrêtent.

## Dédupliquer les effets avec les clés d’idempotence

Un job peut s’exécuter deux fois : le successeur d’un worker planté relance le traitement. Les traitements qui produisent des effets externes les dédupliquent avec `idempotencyKey`.

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

Référence API : [QueueHandlerContext](../../reference/queuehandlercontext/) et [TaskContext](../../reference/taskcontext/).

Une API distante dotée de clés d’idempotence persistantes convient aussi. Un reçu gardé en mémoire, ou écrit séparément de l’effet, est perdu lors d’un plantage. Dérivez une clé par effet quand un traitement en produit plusieurs, et conservez les reçus aussi longtemps qu’un job peut être rejoué.

## Exposer une file via HTTP

`serveTaskQueue()` place n’importe quelle file derrière un point d’accès HTTP. `createHttpTaskQueue()` est un client de file pour les producteurs et workers situés sur d’autres machines.

```ts title="queue-server.ts"
import { createSqliteTaskQueue, serveTaskQueue } from "@elie-laloum/outpost";

const token = process.env.OUTPOST_QUEUE_TOKEN;
if (!token) throw new Error("Set OUTPOST_QUEUE_TOKEN");

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const server = await serveTaskQueue({ queue, token, port: 8788 });
console.log(`Queue at ${server.url}`);
```

Sur une autre machine, `createHttpTaskQueue({ url, token })` renvoie une file à passer à `runQueueWorker()` ou à utiliser avec `enqueue()`. Le jeton compte de 32 à 512 caractères, sans espace. Le serveur écoute sur `127.0.0.1` sauf si vous définissez `host` ; `await server.close()` l’arrête, et vous fermez vous-même la file sous-jacente.

Pour faire tourner les jetons, donnez à `token` une fonction, lue à chaque requête. Celle du serveur renvoie les jetons acceptés ; une liste vide ou une erreur refuse toutes les requêtes.

<!-- canvas -->

- **Ajout**: Le serveur accepte les deux jetons.
  - Étapes
  - **Serveur**: Sa fonction renvoie l’ancien et le nouveau jeton.
  - → **Bascule**: puis
- **Bascule**: Les clients passent au nouveau jeton.
  - Étapes
  - **Clients**: Leur fonction renvoie le nouveau jeton, y compris pour les heartbeats et les finalisations.
  - → **Retrait**: puis
- **Retrait**: Le serveur abandonne l’ancien jeton.
  - Étapes
  - **Serveur**: Sa fonction ne renvoie plus que le nouveau jeton.

## Exploiter les workers

<!-- features -->

- **Déployer les traitements d’abord**: Démarrez les workers qui connaissent un traitement avant que les producteurs mettent des jobs en file pour lui.
- **Monter en charge**: Lancez d’autres workers sur la même file, avec un nom `worker` par processus.
- **Arrêter proprement**: Arrêtez les producteurs, annulez le signal du worker, attendez `runQueueWorker()`, puis fermez la file.
- **Récupérer après un plantage**: Vérifiez que l’ancien processus est arrêté, puis démarrez un remplaçant ; il prend le job à l’expiration du bail.
- **Récupérer un job de workflow**: Libérez le checkpoint de l’exécution plantée comme dans [Exécutions durables](../durable-runs/), puis mettez en file un nouvel identifiant de job pour un traitement `retry-incomplete`.
- **Surveiller**: Suivez l’âge des jobs, les jobs échoués, les erreurs de renouvellement de bail et l’espace de stockage.

Un traitement annulé pendant un arrêt laisse son job `active` ; un autre worker le prend à l’expiration du bail. Un job de workflow repris échoue tant que l’exécution plantée possède encore son checkpoint.

## Choisir le stockage de la file

| Backend      | Création                                                              | Usage                                               | Fermeture             |
| ------------ | --------------------------------------------------------------------- | --------------------------------------------------- | --------------------- |
| SQLite       | `createSqliteTaskQueue(path)`                                         | Des processus d’une machine partageant un fichier.  | `queue.close()`       |
| HTTP         | `createHttpTaskQueue({ url, token })`                                 | Les clients d’une file servie par `serveTaskQueue`. | Rien à fermer         |
| Redis/BullMQ | `createBullMQTaskQueue()` depuis `@elie-laloum/outpost/queues/bullmq` | Des workers répartis sur plusieurs machines.        | `await queue.close()` |

Le système de stockage BullMQ a sa propre configuration : voir [Redis et BullMQ](../redis-workers/).

## Limites

- Les entrées et les valeurs sont du JSON, jusqu’à 256 Kio chacune. Les identifiants et noms de traitements font au plus 512 caractères, un `runId` au plus 256.
- Un worker enregistre au plus 100 traitements.
- Un job échoué garde son résultat. Un `defineQueuedTask()` relancé ou repris retrouve le même job échoué : relancez plutôt dans le traitement.
- Un seul job à la fois par `runId` : un second job pour une exécution encore en cours échoue.
- La file bloque les écritures périmées mais ne garantit pas qu’un effet externe n’ait lieu qu’une fois.
- Un jeton HTTP autorise toutes les opérations de la file. Servez-la derrière TLS sur un réseau privé, et gardez les jetons hors des URL et des logs.

API : [runQueueWorker](../../reference/runqueueworker/) · [createSqliteTaskQueue](../../reference/createsqlitetaskqueue/) · [TaskQueue](../../reference/taskqueue/) · [QueueHandler](../../reference/queuehandler/) · [QueueHandlerContext](../../reference/queuehandlercontext/) · [defineQueuedTask](../../reference/definequeuedtask/) · [defineWorkflowJob](../../reference/defineworkflowjob/) · [serveTaskQueue](../../reference/servetaskqueue/) · [createHttpTaskQueue](../../reference/createhttptaskqueue/).
