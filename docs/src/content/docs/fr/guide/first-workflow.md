---
title: "D’une tâche à un workflow"
description: "Transformer une tâche d’agent en workflow qui corrige le code sur une branche, résume le résultat, attend une approbation et reprend depuis un checkpoint."
---

Transformez le `dispatch()` unique de [Votre première tâche](../first-request/) en workflow : un agent corrige les tests en échec sur une branche, une deuxième tâche résume son résultat en données typées, un mainteneur l’approuve et un checkpoint permet d’arrêter puis de reprendre l’exécution sans refaire le travail terminé.

Un workflow est un graphe nommé de tâches. Chaque étape ci-dessous remplace le contenu d’un seul fichier, `fix.mts`, placé à côté du `outpost.config.mts` d’[Installation](../setup/).

## Exécuter l’agent comme tâche de workflow

```ts title="fix.mts"
import { defineIsolatedTask, defineWorkflow } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const fix = defineIsolatedTask({
  key: "fix",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-tests" },
    brief: { text: "Fix the failing tests, run them and commit the fix." },
  }),
});

const result = await defineWorkflow("fix-tests", [fix]).start();
result.unwrap();
const { branch, commits } = result.value(fix);
console.log(branch, commits);
```

```sh
node fix.mts
```

`defineIsolatedTask()` déclare une tâche dont `request` renvoie les options d’un `dispatch()`. Chaque tentative alloue sa propre sandbox et la ferme quand l’agent a terminé ; annuler le workflow arrête l’agent.

`defineWorkflow()` vérifie le graphe et `start()` l’exécute. Une tâche en échec ne fait pas lever d’exception à `start()` : le résultat porte un `status`, et `unwrap()` lève une exception sauf s’il vaut `"done"`. `result.value(fix)` est le résultat de dispatch typé de la tâche. Le script affiche `outpost/fix-tests` et les commits créés par l’agent.

## Passer le résultat à une autre tâche

```ts title="fix.mts"
import {
  defineIsolatedTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const fix = defineIsolatedTask({
  key: "fix",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-tests" },
    brief: { text: "Fix the failing tests, run them and commit the fix." },
  }),
});
const summary = defineTask({
  key: "summary",
  after: [fix],
  perform: (context) => ({
    branch: context.value(fix).branch,
    commits: context.value(fix).commits.length,
  }),
});

const result = await defineWorkflow("fix-tests", [fix, summary]).start();
result.unwrap();
console.log(result.value(summary));
```

`after: [fix]` fait attendre à `summary` la réussite de `fix`, et `context.value(fix)` lit sa sortie avec son type. Le script affiche par exemple `{ branch: 'outpost/fix-tests', commits: 1 }`.

Les tâches et leurs listes `after` forment un graphe. Une tâche démarre dès que toutes ses dépendances sont terminées, et elle est ignorée si l’une d’elles échoue. Les tâches sans chemin entre elles sont indépendantes : `start({ concurrency: 2 })` en exécute jusqu’à deux à la fois ; par défaut, une seule. [Tâches et dépendances](../task-dependencies/) détaille le graphe.

## Attendre une approbation

```ts title="fix.mts"
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineApprovalTask,
  defineIsolatedTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const agent = defineIsolatedTask({
  key: "fix-agent",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-tests" },
    brief: { text: "Fix the failing tests, run them and commit the fix." },
  }),
});
const fix = defineTask({
  key: "fix",
  perform: async (context) => {
    const { branch, commits } = await agent.perform(context);
    return { branch, commits };
  },
});
const summary = defineTask({
  key: "summary",
  after: [fix],
  perform: (context) => ({
    branch: context.value(fix).branch,
    commits: context.value(fix).commits.length,
  }),
});
const approve = defineApprovalTask({
  key: "approve",
  after: [summary],
  prompt: "Merge outpost/fix-tests?",
  actors: ["maintainer"],
});
const report = defineTask({
  key: "report",
  after: [summary, approve],
  perform: (context) =>
    `${context.value(approve).actor} approved ${context.value(summary).branch}`,
});

const workflow = defineWorkflow("fix-tests", [fix, summary, approve, report]);
const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
const checkpoint = { store, runId: "fix-tests-1", version: "1" };

let result = await workflow.start({ checkpoint });
const pending = result.tasks.find((task) => task.key === "approve")?.pause;
if (pending && process.argv[2] === "approve")
  result = await workflow.start({
    checkpoint,
    decisions: [
      {
        executionId: result.executionId,
        key: "approve",
        requestId: pending.id,
        actor: "maintainer",
        reason: "Reviewed the branch and the test run",
        action: "approve",
      },
    ],
  });
console.log(result.status);
if (result.status === "done") console.log(result.value(report));
```

```sh
node fix.mts
```

`defineApprovalTask()` est une gate : une fois `summary` terminée, l’exécution s’arrête jusqu’à ce qu’un acteur listé dans `actors` approuve ou rejette. `report` ne s’exécute qu’après une approbation ; un rejet l’ignore. Le script affiche `paused` : `start()` a renvoyé `status: "paused"`, et l’enregistrement de la tâche `approve` contient la demande en attente dans `pause`.

Une gate exige un checkpoint, car la demande en attente doit survivre au processus. Un checkpoint est l’état enregistré d’une exécution : statuts, sorties et consommation des tâches. `createWorkflowCheckpointStore()` le conserve sous le `runId` dans `.outpost/storage`. `version` fait partie de son identité : changez-la quand vous modifiez les tâches ou leurs entrées.

Les checkpoints stockent les sorties des tâches en JSON. Un résultat de dispatch porte aussi les méthodes `resume()` et `fork()` : `fix` exécute donc désormais la tâche isolée via son `perform(context)` et ne garde que `branch` et `commits`.

## Reprendre avec la décision

```sh
node fix.mts approve
```

Le script démarre d’abord le workflow pour lire la demande en attente, puis le redémarre avec une décision. La décision désigne l’exécution (`executionId`), la gate (`key`), la demande exacte (`requestId`, c’est-à-dire `pause.id`), l’`actor`, une `reason` et l’`action` : `"approve"` ou `"reject"`. Le script affiche `done` puis `maintainer approved outpost/fix-tests`.

`fix` et `summary` sont restaurées depuis le checkpoint, pas réexécutées : aucune sandbox ne démarre et l’agent n’est pas appelé. Seule `report` s’exécute.

Avant de vous appuyer sur ce mécanisme :

- `actor` est une métadonnée fournie par votre application. Authentifiez la personne avant de soumettre une décision : voir [Approbations](../approvals/).
- Si le processus s’arrête pendant qu’une tâche s’exécute, le `start()` suivant refuse de la rejouer tant que vous ne l’avez pas autorisé : voir [Exécutions persistantes](../durable-runs/).

## Étapes suivantes

- Relancer la correction avec la sortie des tests en retour : [Boucles de vérification](../verification-loops/).
- Mettre en pause au lieu d’échouer quand l’agent atteint une limite d’usage : [Pauses sur quota](../quota-pauses/).
- Exécuter le workflow sans surveillance : [Files de jobs et workers](../job-queues/), [Planification cron](../cron-schedules/) ou [Webhooks](../webhooks/).
- Exiger une décision signée de l’approbateur : [Approbations](../approvals/).
- Rejouer les tâches interrompues et récupérer une exécution plantée : [Exécutions persistantes](../durable-runs/).
