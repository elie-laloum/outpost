---
title: "Planifier une maintenance nocturne"
description: "Planifiez un workflow de maintenance et reprenez la même exécution après une pause liée au quota."
---

[Télécharger tous les fichiers](../../../guide-examples/fr/nightly-maintenance.tar.gz). Extrayez l’archive dans un dossier dédié, lancez `npm install`, puis adaptez `outpost.config.ts` selon [Installation](../setup/). Les commandes ci-dessous indiquent les scripts à exécuter.

<!-- canvas -->

- **Planifier**: Mettre en file le travail de 02 h et sa reprise de 07 h, en semaine à Paris.
  - Planificateur
  - → **Mettre à jour**: job réservé
- **Mettre à jour**: L’agent met à jour les dépendances, teste et committe les changements acceptés.
  - Worker
  - → **Rapport du matin**: tâche terminée
  - → **Pause de quota**: quota atteint
- **Pause de quota**: Conserver la progression ; un job ultérieur reprend quand c’est possible.
  - Worker
  - → **Mettre à jour**: reprise possible
- **Rapport du matin**: Lire le rapport enregistré et relire la branche conservée.
  - Vous

## Planifier les nuits

Les deux planifications donnent le même `runId` à une même nuit, par exemple `deps-2026-09-29`. Le job de 07:00 reprend cette exécution si une limite d’usage l’a mise en pause.

<!-- tabs -->

```ts title="nightly-time.ts"
export const timeZone = "Europe/Paris";
export const runId = (slot: Date) =>
  `deps-${slot.toLocaleDateString("en-CA", { timeZone })}`;
```

```ts title="nightly-schedules.ts"
import { createCronSchedule } from "@elie-laloum/outpost";
import { timeZone, runId } from "./nightly-time.ts";

export const schedules = [
  {
    name: "nightly-deps",
    cron: createCronSchedule("0 2 * * 1-5", { timeZone }),
    handler: "nightly-deps",
    runId,
  },
  {
    name: "nightly-deps-resume",
    cron: createCronSchedule("0 7 * * 1-5", { timeZone }),
    handler: "nightly-deps",
    runId,
  },
];
```

```ts title="scheduler.ts"
import { createSqliteTaskQueue, runSchedules } from "@elie-laloum/outpost";
import { schedules } from "./nightly-schedules.ts";

export const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
export const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runSchedules({ queue, signal: stop.signal, schedules });
} finally {
  queue.close();
}
```

## Exécuter le workflow

Définissez le rapport, l’agent et la tâche de mise à jour.

Le schéma explicite de `report-schema.ts` décrit le JSON d’entrée injecté dans le prompt ; `nightly-report.ts` valide la réponse reçue.

```ts title="report-schema.ts"
export const reportSchema = {
  type: "object",
  properties: {
    updated: { type: "array", items: { type: "string" } },
    skipped: { type: "array", items: { type: "string" } },
  },
  required: ["updated", "skipped"],
};
```

Importez ce schéma dans `nightly-report.ts` pour que les consignes automatiques décrivent la réponse attendue ; la fonction de validation existante continue de vérifier son contenu.

<!-- tabs -->

```ts title="nightly-report.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";
import { reportSchema } from "./report-schema.ts";

export function names(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string"))
    throw new Error("Expected a list of strings");
  return value;
}
export const report = defineJsonResponse({
  tag: "report",
  jsonSchema: reportSchema,
  schema(input) {
    if (typeof input !== "object" || input === null)
      throw new Error("Expected an object");
    if (!("updated" in input) || !("skipped" in input))
      throw new Error("Expected updated and skipped");
    return { updated: names(input.updated), skipped: names(input.skipped) };
  },
});
```

```ts title="nightly-agent.ts"
import {
  createFallbackAgent,
  createAgent,
  createClaudeHarness,
} from "@elie-laloum/outpost";
import { coder } from "./outpost.config.ts";

export const agent = createFallbackAgent(
  [
    coder,
    createAgent({
      harness: createClaudeHarness({ authentication: "account" }),
    }),
  ],
  { on: ["quota"] },
);
```

```ts title="nightly-brief.ts"
export const brief = {
  text: [
    "Update outdated dependencies one at a time.",
    "Run the tests after each update; commit it if they pass, revert it otherwise.",
    "The branch may already hold updates from an earlier attempt: keep them.",
    'End with <report>{"updated": ["name@version"], "skipped": ["name: reason"]}</report>.',
  ].join("\n"),
};
```

```ts title="update-agent.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { agent } from "./nightly-agent.ts";
import { report } from "./nightly-report.ts";
import { brief } from "./nightly-brief.ts";

export function updateAgent(runId: string) {
  return defineIsolatedTask({
    key: "update-agent",
    request: () => ({
      repository,
      sandboxProvider,
      agent,
      branch: { mode: "named", name: `outpost/${runId}` },
      response: report,
      brief,
    }),
  });
}
```

```ts title="update-task.ts"
import { updateAgent } from "./update-agent.ts";
import { defineTask } from "@elie-laloum/outpost";

export function updateTask(runId: string) {
  const agentTask = updateAgent(runId);
  return defineTask({
    key: "update",
    perform: async (context) => {
      const { branch, commits, value } = await agentTask.perform(context);
      return {
        branch,
        commits: commits.map((commit) => commit.subject),
        report: value,
      };
    },
  });
}
```

Publiez le rapport et traitez les jobs avec checkpoint dans `worker.ts`.

<!-- tabs -->

```ts title="publish-report.ts"
import { updateTask } from "./update-task.ts";
import { defineTask } from "@elie-laloum/outpost";
import { mkdir, writeFile } from "node:fs/promises";

export function publishTask(
  runId: string,
  update: ReturnType<typeof updateTask>,
) {
  return defineTask({
    key: "publish",
    after: [update],
    perform: async (context) => {
      await mkdir("reports", { recursive: true });
      const file = `reports/${runId}.json`;
      await writeFile(file, JSON.stringify(context.value(update), null, 2));
      return file;
    },
  });
}
```

```ts title="nightly-workflow.ts"
import { updateTask } from "./update-task.ts";
import { publishTask } from "./publish-report.ts";
import { defineWorkflow } from "@elie-laloum/outpost";

export function nightly(runId: string) {
  const update = updateTask(runId);
  const publish = publishTask(runId, update);
  return defineWorkflow("nightly-deps", [update, publish]);
}
```

```ts title="nightly-job.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
  defineWorkflowJob,
} from "@elie-laloum/outpost";
import { nightly } from "./nightly-workflow.ts";

export const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
export const job = defineWorkflowJob({
  checkpoint: { store, version: "1", resume: "retry-incomplete" },
  start: { onQuota: { action: "pause", maxWaitMs: 4 * 60 * 60_000 } },
  workflow: (_input, { runId }) => nightly(runId),
});
```

```ts title="worker.ts"
import { createSqliteTaskQueue, runQueueWorker } from "@elie-laloum/outpost";
import { job } from "./nightly-job.ts";

export const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
export const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "nightly-1",
    signal: stop.signal,
    handlers: { "nightly-deps": job },
  });
} finally {
  queue.close();
}
```

### Exécuter le script

Lancez chaque commande dans son propre terminal ou service. Ctrl+C arrête l’un ou l’autre proprement.

```sh
node scheduler.ts
node worker.ts
```

### Essayer immédiatement

Laissez le worker ouvert et lancez `node enqueue-now.ts` dans un autre terminal. Il publie un seul job sans attendre la nuit. Lisez ensuite son résultat par l’identifiant affiché, comme dans [Jobs et workers](../job-queues/).

```ts title="enqueue-now.ts"
import { randomUUID } from "node:crypto";
import { createSqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const id = `manual-${randomUUID()}`;
try {
  await queue.enqueue({
    id,
    handler: "nightly-deps",
    input: { runId: id, input: null },
  });
  console.log(id);
} finally {
  queue.close();
}
```

## Comprendre les étapes

, dans le sens de la flèche.

Claude Code peut indiquer quand sa limite se réinitialise ; Codex ne le fait jamais. Une exécution arrêtée par Codex seul attend donc le job de 07:00. Avec l’agent de secours, la tâche ne se met en pause que si les deux agents atteignent leur limite, et la réinitialisation n’est connue que si les deux l’indiquent.

Les tâches terminées viennent toujours du checkpoint. `resume: "retry-incomplete"` autorise les autres à s’exécuter de nouveau : une tâche interrompue par l’arrêt du worker, ou une tâche qui a échoué pendant la nuit.

Si vous arrêtez le worker pendant une exécution, son job revient dans la file après le bail de 30 secondes. Le worker redémarré le reprend et continue à partir de la tâche interrompue.

## Adapter l’exemple

### Une autre tâche de maintenance

Changez le brief et le schéma du rapport : corriger les avertissements du linter, supprimer du code mort, mettre à jour un changelog. Gardez une branche datée par exécution pour que chaque matin ait sa propre relecture.

### Approuver avant de fusionner

Ajoutez un [`defineApprovalTask()`](../approvals/) après `update`, puis une tâche qui fusionne la branche. Le job se termine `paused` et liste la validation dans `pauses`. Soumettez la décision avec `workflow.start()`, le `runId` et la `version` de la valeur du job.

### Utiliser Redis

Remplacez `createSqliteTaskQueue()` par `createBullMQTaskQueue()` de [Redis et BullMQ](../redis-workers/) pour répartir les workers sur plusieurs machines. Donnez à chaque worker un nom `worker` unique.

### Planifier depuis la CI

Sans planificateur permanent, un job de CI planifié peut appeler `nightly(runId).start()` avec les mêmes options `checkpoint` et `onQuota`. Stockez les checkpoints dans [S3 ou R2](../object-storage/) pour que l’exécution de CI suivante reprenne celle qui est en pause ; voir [Exécuter en CI](../ci-automation/).

## Limites

- Un worker tué sans arrêt propre ne libère pas la propriété du checkpoint. Le job suivant de cette exécution échoue tant que vous ne l’avez pas libérée avec `recoverWorkflowCheckpoint()` ([Exécutions durables](../durable-runs/)).
- Une tâche reprise continue la conversation capturée d’un agent unique. Avec un agent de secours, elle repart du premier candidat et du brief d’origine, sur la même branche.
- Un worker exécute les jobs un par un : le job de 07:00 attend donc derrière une exécution encore en cours. Avec plusieurs workers, ce job échoue tant que l’exécution tourne encore.

API : [runSchedules](../../reference/runschedules/) · [createCronSchedule](../../reference/createcronschedule/) · [runQueueWorker](../../reference/runqueueworker/) · [defineWorkflowJob](../../reference/defineworkflowjob/) · [WorkflowQuotaPolicy](../../reference/workflowquotapolicy/) · [createFallbackAgent](../../reference/createfallbackagent/) · [defineJsonResponse](../../reference/definejsonresponse/).
