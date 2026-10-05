---
title: "Travailler sur plusieurs dépôts"
description: "Confiez chaque dépôt à sa propre tâche d’agent et reliez les tâches par leurs dépendances."
---

## Une tâche par dépôt

Confiez chaque dépôt à une tâche `defineIsolatedTask()` et reliez ces tâches dans un workflow. Une sandbox gère un seul dépôt : chaque tâche possède donc sa copie de travail et son historique Git.

<!-- tabs -->

```ts title="upgrade.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { resolve } from "node:path";
import { sandboxProvider, coder } from "./outpost.config.ts";

export function upgrade(key: string, path: string) {
  return defineIsolatedTask({
    key,
    request: () => ({
      repository: resolve(import.meta.dirname, path),
      sandboxProvider,
      agent: coder,
      branch: { mode: "named", name: "outpost/node-24" },
      brief: {
        text: "Move CI and package.json to Node.js 24, run the tests and commit.",
      },
    }),
  });
}
```

```ts title="upgrade-repositories.ts"
import { upgrade } from "./upgrade.ts";
import { defineWorkflow } from "@elie-laloum/outpost";

export const api = upgrade("api", "../api");
export const web = upgrade("web", "../web");
export const result = await defineWorkflow("node-24", [api, web]).start({
  concurrency: 2,
});
result.unwrap();
console.log(result.value(api).commits.length, result.value(web).commits.length);
```

Le script affiche le nombre de commits sur `outpost/node-24` dans chaque checkout. Chaque tâche ouvre son propre worktree et sa propre sandbox, puis les ferme en fin de tâche.

Les chemins sont résolus depuis `import.meta.dirname`, ce qui permet de lancer ce script depuis n’importe quel dossier. Pour régler le nombre de tâches exécutées en parallèle, consultez [WorkflowOptions](../../reference/workflowoptions/).

## Transmettre le résultat d’un dépôt à un autre

Ajoutez la première tâche à `after`, puis lisez son résultat avec `context.value()` dans `request`. Le client démarre dès que la tâche de l’API réussit.

<!-- tabs -->

```ts title="api-change.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { resolve } from "node:path";
import { sandboxProvider, coder } from "./outpost.config.ts";

export const branch = { mode: "named", name: "outpost/rename-field" } as const;
export const api = defineIsolatedTask({
  key: "api",
  request: () => ({
    repository: resolve(import.meta.dirname, "../api"),
    sandboxProvider,
    agent: coder,
    branch,
    brief: {
      text: "Rename user_name to username in GET /users, commit, and describe the change.",
    },
  }),
});
```

```ts title="web-change.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { api, branch } from "./api-change.ts";
import { resolve } from "node:path";
import { sandboxProvider, coder } from "./outpost.config.ts";

export const web = defineIsolatedTask({
  key: "web",
  after: [api],
  request: (context) => ({
    repository: resolve(import.meta.dirname, "../web"),
    sandboxProvider,
    agent: coder,
    branch,
    brief: {
      text: `The API changed:\n${context.value(api).text}\nUpdate this client and commit.`,
    },
  }),
});
```

```ts title="rename.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { api } from "./api-change.ts";
import { web } from "./web-change.ts";

export const result = await defineWorkflow("rename-field", [api, web]).start();
result.unwrap();
```

La dépendance ordonne les tâches. Chaque dépôt garde sa propre branche et son propre historique.

## Quand un dépôt échoue

L’échec d’une tâche n’annule pas les autres. Par défaut, le premier échec arrête l’exécution ; `stopOnError: false` laisse les dépôts indépendants aller au bout.

| Ce qui s’est passé                           | Ce que vous faites                                                                                                                                              |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Une tâche est `failed`                       | Lisez `task.error` dans `result.tasks`. Son worktree reste sous `.outpost/workspaces/` dans ce checkout, avec le travail de l’agent.                            |
| D’autres tâches sont `cancelled`             | Elles tournaient ou attendaient quand le premier échec a arrêté l’exécution. Leurs worktrees restent aussi. Passez `stopOnError: false` pour les laisser finir. |
| Une tâche dépendante est `skipped`           | Elle n’a pas tourné, car une tâche de son `after` n’a pas réussi.                                                                                               |
| Certains dépôts sont `done`, un autre non    | Leurs branches restent telles quelles. Gardez-les, ou supprimez-les vous-même.                                                                                  |
| Vous relancez le script après une correction | Toutes les tâches repartent, y compris celles déjà `done`. Une branche `named` reprend son worktree conservé tel quel.                                          |

Pour ne relancer que les tâches inachevées, ajoutez un checkpoint : [Exécutions durables](../durable-runs/). [Récupérer du travail](../recovery/) inspecte les worktrees conservés.

## Attendre un accord avant de publier

Outpost ne pousse rien. Placez le push ou le merge dans une tâche située après une étape d’approbation [`defineApprovalTask()`](../approvals/) dont le `after` liste chaque tâche de dépôt.

Une étape d’approbation exige un checkpoint, et les checkpoints ne contiennent que du JSON. Enveloppez chaque tâche isolée dans un `defineTask()` qui garde `repository`, `branch` et `commits`. [Modifier plusieurs dépôts](../multi-repository-change/) en donne l’exemple complet, avec l’approbation.

## Limites

- Aucune opération Git ne couvre plusieurs dépôts : ni commit commun, ni rollback, ni push.
- Le résultat d’une tâche isolée n’est pas du JSON : il ne peut être ni mis en cache ni placé dans un checkpoint sans tâche d’enveloppe.

API : [defineIsolatedTask](../../reference/defineisolatedtask/) · [defineWorkflow](../../reference/defineworkflow/) · [WorkflowOptions](../../reference/workflowoptions/) · [TaskContext](../../reference/taskcontext/) · [WorkflowResult](../../reference/workflowresult/).
