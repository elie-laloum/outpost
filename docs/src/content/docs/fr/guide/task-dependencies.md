---
title: "Tâches et dépendances"
description: "Déclarer des tâches, relier leurs sorties typées dans un graphe, l’exécuter et lire le résultat de chaque tâche."
---

## Définir des tâches et un workflow

Une tâche est une étape identifiée par une `key` unique, avec une fonction `perform`. Un workflow est la liste des tâches, ordonnée par leurs dépendances `after`.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const files = defineTask({ key: "files", perform: () => ["src/parser.ts"] });
const report = defineTask({
  key: "report",
  after: [files],
  perform: (context) => ({ reviewed: context.value(files).length }),
});
const result = await defineWorkflow("review", [files, report]).start();
result.unwrap();
console.log(result.value(report));
```

<!-- check:run -->

Le script affiche `{ reviewed: 1 }`. `defineTask()` et `defineWorkflow()` ne font que déclarer le graphe : rien ne s’exécute avant `start()`.

## Lire une dépendance

Listez une tâche dans `after`, puis lisez sa sortie avec `context.value(task)`. La valeur garde le type renvoyé par le `perform` de cette tâche.

`context.value()` lève une exception pour une tâche absente de `after`, même si elle s’est déjà exécutée. Une tâche ne démarre qu’une fois toutes les tâches de son `after` à l’état `done`.

## Corriger les erreurs du graphe

`defineWorkflow()` vérifie le graphe avant toute exécution et lève une exception à la première erreur.

| Erreur de construction                                | Message                                        |
| ----------------------------------------------------- | ---------------------------------------------- |
| Deux tâches partagent une clé                         | `Duplicate task: test`                         |
| Une tâche de `after` manque dans la liste du workflow | `publish: missing dependency lint`             |
| Des tâches dépendent les unes des autres en boucle    | `Dependency cycle at report`                   |
| Une clé ne respecte pas `[A-Za-z0-9][A-Za-z0-9._-]*`  | `Invalid task key: …`, levé par `defineTask()` |

## Lire les résultats

`start()` se résout avec un `WorkflowResult` dès qu’aucune tâche ne peut plus s’exécuter, même si des tâches ont échoué. La promesse est rejetée si une option est invalide ou si un checkpoint ne peut pas être enregistré.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const lint = defineTask({
  key: "lint",
  perform: () => {
    throw new Error("2 lint errors");
  },
});
const test = defineTask({ key: "test", perform: () => "ok" });
const result = await defineWorkflow("checks", [lint, test]).start();
console.log(result.status);
for (const task of result.tasks)
  console.log(task.key, task.status, task.error ?? "");
```

<!-- check:run -->

Le script affiche `failed`, puis `lint failed 2 lint errors` et `test cancelled` : par défaut, le premier échec annule les tâches qui n’ont pas terminé.

| Membre        | Contenu                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `status`      | `"done"`, `"failed"`, `"cancelled"`, `"paused"` (une gate ou une pause de quota) ou `"waiting-input"`.                |
| `unwrap()`    | Lève une [`WorkflowFailure`](../../reference/workflowfailure/) qui porte le résultat, sauf si `status` vaut `"done"`. |
| `value(task)` | La sortie de la tâche. Lève une exception si la tâche n’a pas terminé à l’état `done` pendant cette exécution.        |
| `tasks`       | Un enregistrement par tâche : `key`, `status`, `attempts`, `startedAt`, `finishedAt`, `error`.                        |
| `errors`      | Les erreurs qui ont fait échouer l’exécution.                                                                         |
| `usage`       | Les tentatives effectuées et les tokens déclarés par les tâches d’agent, cumulés sur l’exécution.                     |

## Exécuter des tâches en parallèle

Par défaut, `start()` exécute une tâche à la fois, dans l’ordre de la liste. Passez `concurrency` pour exécuter ensemble les tâches indépendantes.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const lint = defineTask({ key: "lint", perform: () => ({ warnings: 0 }) });
const test = defineTask({ key: "test", perform: () => ({ failed: 0 }) });
const report = defineTask({
  key: "report",
  after: [lint, test],
  perform: (context) =>
    context.value(lint).warnings + context.value(test).failed === 0,
});
const result = await defineWorkflow("checks", [lint, test, report]).start({
  concurrency: 2,
});
result.unwrap();
console.log(result.value(report));
```

<!-- check:run -->

`lint` et `test` s’exécutent ensemble, puis `report` affiche `true`. Les relances, les délais et ce qu’un échec interrompt sont décrits dans [Concurrence, relances et délais](../concurrency-and-retries/).

## Ignorer une tâche

`condition` s’exécute avant la première tentative de la tâche. Si elle renvoie `false`, la tâche se termine à l’état `skipped` sans s’exécuter.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const changes = defineTask({ key: "changes", perform: (): string[] => [] });
const review = defineTask({
  key: "review",
  after: [changes],
  condition: (context) => context.value(changes).length > 0,
  perform: (context) => `Reviewed ${context.value(changes).length} files`,
});
const result = await defineWorkflow("review", [changes, review]).start();
console.log(
  result.status,
  result.tasks.map((task) => task.status),
);
```

<!-- check:run -->

Le script affiche `done [ 'done', 'skipped' ]`. Une tâche ignorée ne fait pas échouer l’exécution, n’a pas de valeur et fait ignorer toutes les tâches qui en dépendent.

## Dessiner le graphe

`diagram()` renvoie le graphe sous forme de flowchart Mermaid, à placer dans un README ou une pull request.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const lint = defineTask({ key: "lint", perform: () => 0 });
const report = defineTask({ key: "report", after: [lint], perform: () => 0 });
console.log(defineWorkflow("checks", [lint, report]).diagram());
```

<!-- check:run -->

```text
flowchart LR
  n0["lint"]
  n1["report"]
  n0 --> n1
```

## Partager une sandbox

`defineAgentTask()` et `defineCommandTask()` s’exécutent dans une sandbox que vous avez ouverte avec [`createSandbox()`](../sandbox-sessions/). Les tâches partagent ses fichiers ; c’est vous qui la fermez.

```ts
import {
  createSandbox,
  defineAgentTask,
  defineCommandTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
const fix = defineAgentTask({
  key: "fix",
  sandbox,
  request: () => ({ brief: { text: "Fix the failing date tests." } }),
});
const test = defineCommandTask({
  key: "test",
  after: [fix],
  sandbox,
  command: { executable: "npm", arguments: ["test"] },
});
const result = await defineWorkflow("fix-dates", [fix, test]).start();
result.unwrap();
```

`test` lance `npm test` sur les modifications de l’agent. Un code de sortie non nul fait échouer la tâche.

## Quel type de tâche ?

Chaque déclaration renvoie une tâche que vous listez dans `defineWorkflow()` et reliez avec `after`.

| Déclaration                                                                 | Usage                                                                       | Guide                                             |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------- |
| [`defineTask`](../../reference/definetask/)                                 | Votre propre code, qui renvoie une valeur.                                  | Cette page                                        |
| [`defineIsolatedTask`](../../reference/defineisolatedtask/)                 | Une tâche d’agent dans sa propre sandbox, ouverte et fermée par la tâche.   | [D’une tâche à un workflow](../first-workflow/)   |
| [`defineAgentTask`](../../reference/defineagenttask/)                       | Un tour d’agent dans une sandbox que vous gardez ouverte.                   | [Partager une sandbox](#partager-une-sandbox)     |
| [`defineCommandTask`](../../reference/definecommandtask/)                   | Une commande dans une sandbox que vous gardez ouverte.                      | [Partager une sandbox](#partager-une-sandbox)     |
| [`defineLoopTask`](../../reference/definelooptask/)                         | Des essais vérifiés par tours, avec le contrôle échoué comme feedback.      | [Boucles de vérification](../verification-loops/) |
| [`defineQueuedTask`](../../reference/definequeuedtask/)                     | Un travail confié à un worker via une file de jobs.                         | [Files de jobs et workers](../job-queues/)        |
| [`defineApprovalTask`](../../reference/defineapprovaltask/)                 | Une pause jusqu’à l’approbation ou au rejet d’une personne listée.          | [Approbations](../approvals/)                     |
| [`definePauseTask`](../../reference/definepausetask/)                       | Une pause jusqu’à la reprise ou au rejet par une personne listée.           | [Approbations](../approvals/)                     |
| [`defineInteractiveAgentTask`](../../reference/defineinteractiveagenttask/) | Un dialogue d’agent qui attend des réponses humaines entre les tours.       | [Tâches interactives](../interactive-tasks/)      |
| [`defineArtifactTask`](../../reference/defineartifacttask/)                 | Une valeur publiée comme artefact ; les dépendants reçoivent une référence. | [Artefacts](../artifacts/)                        |
| [`defineWorkflowJob`](../../reference/defineworkflowjob/)                   | Pas une tâche : exécute un workflow entier comme job de file.               | [Files de jobs et workers](../job-queues/)        |

:::caution
`defineIsolatedTask()` et `defineAgentTask()` renvoient un résultat de dispatch doté de méthodes, qu’un checkpoint ne peut pas stocker. Dans une exécution avec checkpoint, appelez-les depuis une `defineTask()` qui renvoie du JSON, comme dans [D’une tâche à un workflow](../first-workflow/). Voir [Exécutions durables](../durable-runs/).
:::

## Limites

- Les sorties restent en mémoire le temps d’un `start()`. Une exécution relancée réexécute toutes les tâches, sauf si vous passez un [checkpoint](../durable-runs/).
- Les tâches d’approbation et de pause, les tâches interactives, les pauses de quota, `answers` et `decisions` exigent un checkpoint : sans lui, `start()` lève une exception.
- Un workflow ne committe, ne fusionne et ne pousse pas les tâches en une seule transaction. Pour modifier plusieurs dépôts, voir [Plusieurs dépôts](../multiple-repositories/).

API : [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/) · [TaskContext](../../reference/taskcontext/) · [WorkflowResult](../../reference/workflowresult/) · [TaskRecord](../../reference/taskrecord/) · [WorkflowFailure](../../reference/workflowfailure/)
