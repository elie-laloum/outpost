---
title: "Relier les tâches et leurs dépendances"
description: "Définissez les tâches, déclarez leurs dépendances et lisez leurs résultats typés."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="relier-les-étapes"></span>
<span id="vérifier-le-résultat-dune-tâche"></span>
<span id="choisir-un-type-de-tâche"></span>

Le premier exemple s’exécute entièrement dans Node.js : installez Outpost dans un projet ESM, enregistrez-le dans `dependencies.ts` puis lancez `node dependencies.ts`. Aucun agent, compte ni sandbox n’est nécessaire pour découvrir le graphe.

## Définir des tâches et un workflow

Déclarez chaque étape avec une fonction de définition de tâche, puis passez les tâches à `defineWorkflow()`. Les dépendances déterminent l’ordre d’exécution et les résultats précédents qu’une tâche peut lire.

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
// Example output: { reviewed: 1 }
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
// Example output: failed
for (const task of result.tasks)
  console.log(task.key, task.status, task.error ?? "");
// Example output: lint failed 2 lint errors
```

<!-- check:run -->

Le script affiche `failed`, puis `lint failed 2 lint errors` et `test cancelled` : par défaut, le premier échec annule les tâches qui n’ont pas terminé.

Référence API : [WorkflowResult](../../reference/workflowresult/) et [TaskRecord](../../reference/taskrecord/).

## Exécuter des tâches en parallèle

Les tâches indépendantes peuvent s’exécuter ensemble si vous augmentez `concurrency`. Le guide [Parallélisme et nouvelles tentatives](../concurrency-and-retries/) fournit un exemple. Les tâches partageant une sandbox doivent rester séquentielles : reliez-les avec `after`.

## Ignorer une tâche

Utilisez `condition` lorsqu’une tâche ne s’applique qu’à certaines entrées. Une condition fausse ignore la tâche et ses dépendantes, sans produire de valeur. Consultez l’[exemple de tâche conditionnelle](../concurrency-and-retries/#sauter-une-tâche-avec-une-condition) avant de lire ce résultat.

## Afficher les dépendances

`diagram()` renvoie le graphe sous forme de flowchart Mermaid, à placer dans un README ou une pull request.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const lint = defineTask({ key: "lint", perform: () => 0 });
const report = defineTask({ key: "report", after: [lint], perform: () => 0 });
console.log(defineWorkflow("checks", [lint, report]).diagram());
// Example output: flowchart LR
```

<!-- check:run -->

```text
flowchart LR
  n0["lint"]
  n1["report"]
  n0 --> n1
```

<span id="partager-une-sandbox-entre-les-tâches"></span>

Pour exécuter des tâches sur les mêmes fichiers, suivez [Partager une sandbox](../sandbox-sessions/#partager-une-sandbox-entre-les-tâches).

## Choisir le type de tâche

Choisissez la déclaration selon le travail à exécuter et la gestion de ses ressources.

| Votre étape nécessite                             | Utilisez                                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Votre propre fonction                             | [defineTask](../../reference/definetask/)                                                                      |
| Un agent avec sa propre sandbox                   | [defineIsolatedTask](../../reference/defineisolatedtask/)                                                      |
| Un agent ou une commande dans une sandbox ouverte | [defineAgentTask](../../reference/defineagenttask/) ou [defineCommandTask](../../reference/definecommandtask/) |
| Une nouvelle tentative après un contrôle refusé   | [Une boucle de vérification](../verification-loops/)                                                           |

Ajoutez [approbations](../approvals/), [questions humaines](../interactive-tasks/), [travail en file](../job-queues/) ou [artefacts](../artifacts/) lorsque ces étapes deviennent nécessaires.

:::caution
Les résultats de dispatch contiennent des méthodes et ne peuvent pas être enregistrés directement dans un checkpoint. Pour une exécution durable, appelez l’agent depuis une tâche qui retourne une projection JSON et déclare sa consommation, comme dans [Enregistrer et reprendre un workflow](../durable-runs/).
:::

## Limites

- Les sorties restent en mémoire le temps d’un `start()`. Une exécution relancée réexécute toutes les tâches, sauf si vous passez un [checkpoint](../durable-runs/).
- Les tâches d’approbation et de pause, les tâches interactives, les pauses de quota, `answers` et `decisions` exigent un checkpoint : sans lui, `start()` lève une exception.
- Un workflow ne committe, ne fusionne et ne pousse pas les tâches en une seule transaction. Pour modifier plusieurs dépôts, voir [Plusieurs dépôts](../multiple-repositories/).

API : [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/) · [TaskContext](../../reference/taskcontext/) · [WorkflowResult](../../reference/workflowresult/) · [TaskRecord](../../reference/taskrecord/) · [WorkflowFailure](../../reference/workflowfailure/)
