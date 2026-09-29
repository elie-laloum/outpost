---
title: "Maintenance nocturne"
description: "Chaque nuit de semaine, un agent met à jour les dépendances sur une branche datée. L’exécution résiste aux redémarrages du worker et aux limites d’usage, et laisse une branche et un rapport typé pour le matin."
---

## Ce que vous utilisez

<!-- features -->

- [Planification cron](../cron-schedules/): Publie un job par nuit, dans votre fuseau horaire.
  - `runSchedules()`
  - `createCronSchedule()`
- [Files de jobs et workers](../job-queues/): Exécute chaque job dans un processus worker séparé.
  - `runQueueWorker()`
  - `defineWorkflowJob()`
- [Exécutions durables](../durable-runs/): Enregistre chaque tâche terminée dans un checkpoint.
  - `createWorkflowCheckpointStore()`
- [Pauses sur quota](../quota-pauses/): Met en pause sur une limite d’usage au lieu d’échouer.
  - `onQuota`
- [Agents de secours](../fallback-agents/): Confie le travail à un second agent quand la limite est atteinte.
  - `createFallbackAgent()`
- [Réponses typées](../typed-responses/): Valide le rapport final de l’agent.
  - `defineJsonResponse()`

Deux processus partagent la file `.outpost/jobs.sqlite` : le planificateur publie les jobs, le worker les exécute. Enregistrez les deux fichiers à côté du `outpost.config.mts` d’[Installation](../setup/).

## Planifier les nuits

```ts title="scheduler.mts"
import {
  createCronSchedule,
  createSqliteTaskQueue,
  runSchedules,
} from "@elie-laloum/outpost";

const timeZone = "Europe/Paris";
// en-CA formate la date locale en AAAA-MM-JJ.
const runId = (slot: Date) =>
  `deps-${slot.toLocaleDateString("en-CA", { timeZone })}`;

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runSchedules({
    queue,
    signal: stop.signal,
    schedules: [
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
    ],
  });
} finally {
  queue.close();
}
```

Les deux planifications donnent le même `runId` à une même nuit, par exemple `deps-2026-09-29`. Le job de 07:00 reprend cette exécution si une limite d’usage l’a mise en pause.

## Exécuter le workflow

```ts title="worker.mts"
import { mkdir, writeFile } from "node:fs/promises";
import {
  createAgent,
  createClaudeHarness,
  createFallbackAgent,
  createLocalTransport,
  createSqliteTaskQueue,
  createWorkflowCheckpointStore,
  defineIsolatedTask,
  defineJsonResponse,
  defineTask,
  defineWorkflow,
  defineWorkflowJob,
  runQueueWorker,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

function names(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string"))
    throw new Error("Expected a list of strings");
  return value;
}
const report = defineJsonResponse({
  tag: "report",
  schema(input) {
    if (typeof input !== "object" || input === null)
      throw new Error("Expected an object");
    if (!("updated" in input) || !("skipped" in input))
      throw new Error("Expected updated and skipped");
    return { updated: names(input.updated), skipped: names(input.skipped) };
  },
});

// Facultatif : Claude Code prend le relais quand Codex atteint sa limite.
const agent = createFallbackAgent(
  [
    coder,
    createAgent({
      harness: createClaudeHarness({ authentication: "account" }),
    }),
  ],
  { on: ["quota"] },
);

function nightly(runId: string) {
  const agentTask = defineIsolatedTask({
    key: "update-agent",
    request: () => ({
      repository,
      sandboxProvider,
      agent,
      branch: { mode: "named", name: `outpost/${runId}` },
      response: report,
      brief: {
        text: [
          "Update outdated dependencies one at a time.",
          "Run the tests after each update; commit it if they pass, revert it otherwise.",
          "The branch may already hold updates from an earlier attempt: keep them.",
          'End with <report>{"updated": ["name@version"], "skipped": ["name: reason"]}</report>.',
        ].join("\n"),
      },
    }),
  });
  const update = defineTask({
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
  const publish = defineTask({
    key: "publish",
    after: [update],
    perform: async (context) => {
      await mkdir("reports", { recursive: true });
      const file = `reports/${runId}.json`;
      await writeFile(file, JSON.stringify(context.value(update), null, 2));
      return file;
    },
  });
  return defineWorkflow("nightly-deps", [update, publish]);
}

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "nightly-1",
    signal: stop.signal,
    handlers: {
      "nightly-deps": defineWorkflowJob({
        checkpoint: { store, version: "1", resume: "retry-incomplete" },
        start: { onQuota: { action: "pause", maxWaitMs: 4 * 60 * 60_000 } },
        workflow: (_input, { runId }) => nightly(runId),
      }),
    },
  });
} finally {
  queue.close();
}
```

```sh
node scheduler.mts
node worker.mts
```

Lancez chaque commande dans son propre terminal ou service. Ctrl+C arrête l’un ou l’autre proprement.

## Comment ça marche

<!-- flow -->

1. **La nuit**: À 02:00, heure de Paris, du lundi au vendredi.
   - **Publier**: Le planificateur publie le job `schedule:nightly-deps:<slot>`.
     - `runSchedules()`
   - **Prendre le job**: Le worker démarre le workflow sous le checkpoint `deps-<date>`.
     - `defineWorkflowJob()`
   - **Mettre à jour**: L’agent committe sur `outpost/deps-<date>` et renvoie son rapport.
     - `update`
     - sandbox
   - **Écrire le rapport**: `publish` enregistre la branche, les commits et le rapport dans `reports/deps-<date>.json`.
     - `publish`
     - hôte
2. **Limite d’usage**: La tâche s’arrête sans consommer de nouvelle tentative.
   - **Passer le relais**: Claude Code repart du brief d’origine sur la même branche.
     - `createFallbackAgent()`
   - **Attendre**: Une réinitialisation dans la limite de `maxWaitMs` fait patienter le worker, puis la tâche repart.
     - `maxWaitMs`
   - **Mettre en pause**: Une réinitialisation plus tardive ou inconnue met la tâche en pause ; le job se termine avec le statut `paused`.
     - `onQuota`
3. **Le matin**: À 07:00, le même `runId` à nouveau.
   - **Reprendre**: Une tâche en pause repart, sauf si sa réinitialisation dépasse encore `maxWaitMs`.
     - `nightly-deps-resume`
   - **Relire**: Vous consultez la branche et son fichier de rapport.
     - hôte

Claude Code peut indiquer quand sa limite se réinitialise ; Codex ne le fait jamais. Une exécution arrêtée par Codex seul attend donc le job de 07:00. Avec l’agent de secours, la tâche ne se met en pause que si les deux agents atteignent leur limite, et la réinitialisation n’est connue que si les deux l’indiquent.

Les tâches terminées viennent toujours du checkpoint. `resume: "retry-incomplete"` autorise les autres à s’exécuter de nouveau : une tâche interrompue par l’arrêt du worker, ou une tâche qui a échoué pendant la nuit.

Si vous arrêtez le worker pendant une exécution, son job revient dans la file après le bail de 30 secondes. Le worker redémarré le reprend et continue à partir de la tâche interrompue.

## L’adapter

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
