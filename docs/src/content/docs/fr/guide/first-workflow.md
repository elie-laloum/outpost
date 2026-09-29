---
title: "D’une tâche à un workflow"
description: "Transformer une tâche d’agent en workflow qui corrige le code sur une branche, résume le résultat, attend une approbation et reprend depuis un checkpoint."
---

<!-- flow -->

1. **Première exécution**: S’arrête à l’approbation.
   - `fix`: L’agent corrige les tests sur une branche.
     - `defineIsolatedTask()`
   - `summary`: Garde des données typées du résultat.
     - `defineTask()`
   - `approve`: Met l’exécution en pause en attendant une décision.
     - `defineApprovalTask()`
2. **Seconde exécution**: Reprend avec la décision.
   - `report`: S’exécute une fois l’approbation donnée.
     - `defineTask()`

Un workflow est un graphe de tâches. Chaque étape remplace `fix.mts`, placé à côté du `outpost.config.mts` d’[Installation](../setup/).

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

Le script affiche `outpost/fix-tests` et les commits de l’agent. `defineIsolatedTask()` exécute un `dispatch()` comme tâche, dans sa propre sandbox. `unwrap()` lève une exception sauf si le `status` de l’exécution vaut `"done"`.

## Passer le résultat à une autre tâche

```ts title="fix.mts" ins={3,18-25,27,29}
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

Le script affiche `{ branch: 'outpost/fix-tests', commits: 1 }`. `after: [fix]` démarre `summary` une fois `fix` réussie, et `context.value(fix)` lit sa sortie typée. [Tâches et dépendances](../task-dependencies/) traite des échecs et de la concurrence.

## Attendre une approbation

```ts title="fix.mts" ins={2-4,11-12,21-27,36-47,49-72}
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

Le script affiche `paused`. La gate `approve` arrête l’exécution jusqu’à ce qu’un acteur listé dans `actors` décide ; l’enregistrement de sa tâche contient la demande dans `pause`.

Une gate exige un **checkpoint**, l’état enregistré d’une exécution (statuts, sorties et consommation), ici sous `.outpost/storage`. Changez `version` quand vous modifiez les tâches.

Les checkpoints stockent du JSON, pas les méthodes d’un résultat de dispatch. `fix` appelle donc `agent.perform(context)` et ne garde que `branch` et `commits`.

## Reprendre avec la décision

```sh
node fix.mts approve
```

Le script affiche `done` puis `maintainer approved outpost/fix-tests`. `fix` et `summary` viennent du checkpoint : seule `report` s’exécute.

| Champ de la décision | Valeur                         |
| -------------------- | ------------------------------ |
| `executionId`        | `result.executionId`           |
| `key`                | `"approve"`, la clé de la gate |
| `requestId`          | `pause.id`                     |
| `actor`              | L’un des `actors` de la gate   |
| `reason`             | Une explication non vide       |
| `action`             | `"approve"` ou `"reject"`      |

:::caution
Authentifiez la personne avant de soumettre son `actor` : voir [Approbations](../approvals/). Une tâche interrompue en cours d’exécution n’est rejouée qu’avec votre autorisation : voir [Exécutions durables](../durable-runs/).
:::

## Étapes suivantes

<!-- features -->

- [Tâches et dépendances](../task-dependencies/): Organiser le graphe et paralléliser les tâches.
- [Boucles de vérification](../verification-loops/): Relancer avec la sortie des tests en retour.
- [Approbations](../approvals/): Authentifier les approbateurs et signer les décisions.
- [Exécutions durables](../durable-runs/): Autoriser les rejeux et récupérer les exécutions plantées.
- [Pauses sur quota](../quota-pauses/): Mettre en pause quand l’agent atteint une limite d’usage.
- [Files de jobs et workers](../job-queues/): Exécuter les workflows sans surveillance.
