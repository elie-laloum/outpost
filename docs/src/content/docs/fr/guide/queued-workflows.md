---
title: "Exécuter des workflows depuis une file"
description: "Partez du producteur et du worker."
---

Partez du [producteur et du worker](../job-queues/). Une tâche en file attend un résultat distant ; un job de workflow conserve sa progression entre les processus.

## Attendre un job dans un workflow

`defineQueuedTask()` est une tâche de workflow qui met un job en file, l’interroge jusqu’à ce qu’il se termine et valide sa valeur avec `decode`.

```ts
import * as outpost from "@elie-laloum/outpost";
const queue = await outpost.createSqliteTaskQueue(".outpost/jobs.sqlite");
const count = outpost.defineQueuedTask({
  key: "count",
  queue,
  handler: "count",
  input: () => [1, 2, 3],
  decode: (value) => {
    if (typeof value !== "number") throw new Error("Expected a count");
    return value;
  },
});
console.log(
  (await outpost.defineWorkflow("count-items", [count]).start()).value(count),
);
// Example output: 3
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

Lancez ce worker avec `node workflow-worker.ts`. Il utilise la même file que le producteur.

```ts title="workflow-worker.ts"
import { createSqliteTaskQueue, runQueueWorker } from "@elie-laloum/outpost";
import { fix } from "./fix-job.ts";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "workflow-worker",
    signal: stop.signal,
    handlers: { fix },
  });
} finally {
  queue.close();
}
```

Enregistrez-le dans le worker avec `handlers: { fix }`. Pour chaque job, `workflow` construit le graphe à partir de `input` et le démarre sous le `runId` du job ; la même entrée doit construire le même graphe. Passez les autres options de démarrage, comme `concurrency`, `budget`, `onQuota` ou `timeoutMs`, dans `start`.

Le résultat enregistré permet au producteur de consulter le workflow terminé.

Référence API : [QueueHandlerContext](../../reference/queuehandlercontext/).

`result.usage` contient l’usage cumulé des tokens de l’exécution. Une exécution `failed`, `cancelled` ou `rejected` fait échouer le job ; une exécution en pause ou en attente le termine normalement. Le résumé dans `result.value` garde le statut du workflow et son `terminationCode` : un refus de gate reste donc identifiable comme `rejected`, même si le job porte le statut `failed`. Voir [les codes de terminaison](../../reference/workflowterminationcode/).

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
// Example output: pending
queue.close();
```

<!-- check:run -->

Le script affiche `pending` jusqu’à ce qu’un worker exécute le job. Les tâches `done` proviennent du checkpoint. Les tâches échouées ou interrompues ne sont relancées que si le traitement définit `checkpoint: { store, version: "1", resume: "retry-incomplete" }` : voir [Exécutions durables](../durable-runs/).

### Approuver ou répondre à une exécution en pause

`start` exclut `decisions` et `answers` : soumettez-les depuis votre application. Construisez le même workflow et appelez `workflow.start()` avec `checkpoint: { store, runId, version }` issus de la valeur du job, plus `decisions` ([approbations](../approvals/)) ou `answers` ([tâches interactives](../interactive-tasks/)).

## Exécuter des jobs indépendants

Cette factory déclare une commande éphémère distincte pour chaque clé de tâche.

```ts title="file-task.ts"
import { defineIsolatedCommandTask } from "@elie-laloum/outpost";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";

export function fileTask(key: string) {
  return defineIsolatedCommandTask({
    key,
    request: () => ({
      workspaceSource: { kind: "ephemeral" },
      sandboxProvider: createLocalSandboxProvider(),
      command: { executable: "node", arguments: ["-p", "process.cwd()"] },
    }),
  });
}
```

Exécutez les deux tâches ensemble ; leurs racines et leurs sandboxes restent distinctes.

```ts title="independent-files.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { fileTask } from "./file-task.ts";

const left = fileTask("left"),
  right = fileTask("right");
await defineWorkflow("independent-files", [left, right]).start({
  concurrency: 2,
});
```

Le fournisseur local utilisé ici exécute directement sur l'hôte, sans isolation. Chaque tâche isolée possédée et chaque job de file reçoit une identité et une racine propres. Une sandbox partagée reste séquentielle. Les wrappers durables utilisent un coordinateur commun de checkpoints de workspaces. Les workspaces empruntés restent sous responsabilité du appelant et ne deviennent pas automatiquement restaurables. Les caches de tâches contiennent des résultats JSON ; un hit ne reproduit pas des écritures de fichiers.
