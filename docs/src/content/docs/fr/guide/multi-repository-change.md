---
title: "Modifier plusieurs dépôts"
description: "Un agent renomme un champ dans une API et décrit la modification ; deux agents mettent à jour les clients web et mobile à partir de cette description, en même temps ; un mainteneur approuve avant toute fusion."
---

## Ce que vous utilisez

<!-- features -->

- [Plusieurs dépôts](../multiple-repositories/): Une tâche par checkout, chacune avec sa sandbox et sa branche.
  - `defineIsolatedTask()`
- [Réponses typées](../typed-responses/): L’agent de l’API renvoie une description validée de sa modification.
  - `defineJsonResponse()`
- [Tâches et dépendances](../task-dependencies/): Les clients démarrent après l’API et lisent son résultat.
  - `after`
  - `context.value()`
- [Concurrence, relances et délais](../concurrency-and-retries/): Les deux clients s’exécutent en même temps.
  - `concurrency`
  - `stopOnError`
- [Approbations](../approvals/): Un mainteneur décide avant toute fusion.
  - `defineApprovalTask()`
- [Exécutions durables](../durable-runs/): Le checkpoint conserve le travail terminé d’une exécution à l’autre.
  - `createWorkflowCheckpointStore()`

## Le code

Placez le fichier à côté du `outpost.config.mts` d’[Installation](../setup/) et remplacez les trois chemins par vos checkouts.

```ts title="rename-field.mts"
import { execFileSync } from "node:child_process";
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineApprovalTask,
  defineIsolatedTask,
  defineJsonResponse,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import type { DispatchResult } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.mts";

const branch = { mode: "named", name: "outpost/rename-user-name" } as const;
const delivery = (repository: string, result: DispatchResult<unknown>) => ({
  repository,
  branch: result.branch,
  commits: result.commits,
});

const rename = defineJsonResponse({
  tag: "rename",
  schema(input) {
    const { from, to, notes } = Object(input) as Record<string, unknown>;
    if (
      typeof from !== "string" ||
      typeof to !== "string" ||
      typeof notes !== "string"
    )
      throw new Error("Expected from, to and notes as strings");
    return { from, to, notes };
  },
});

const apiAgent = defineIsolatedTask({
  key: "api-agent",
  request: () => ({
    repository: "/projects/api",
    sandboxProvider,
    agent: coder,
    branch,
    response: rename,
    brief: {
      text: `Rename the user_name field of GET /users to username.
Update the handlers, the OpenAPI schema and the tests, run the tests and commit.
Finish with <rename>{"from":"<old>","to":"<new>","notes":"<what clients must change>"}</rename>.`,
    },
  }),
});
const api = defineTask({
  key: "api",
  perform: async (context) => {
    const result = await apiAgent.perform(context);
    return { ...delivery("/projects/api", result), change: result.value };
  },
});

function client(key: string, repository: string) {
  const agent = defineIsolatedTask({
    key: `${key}-agent`,
    request: (context) => {
      const { change } = context.value(api);
      return {
        repository,
        sandboxProvider,
        agent: coder,
        branch,
        brief: {
          text: `The API renamed ${change.from} to ${change.to}. ${change.notes}
Update this client, run its tests and commit.`,
        },
      };
    },
  });
  return defineTask({
    key,
    after: [api],
    perform: async (context) =>
      delivery(repository, await agent.perform(context)),
  });
}
const clients = [
  client("web", "/projects/web"),
  client("mobile", "/projects/mobile"),
];

const approve = defineApprovalTask({
  key: "approve",
  after: [api, ...clients],
  prompt: "Merge outpost/rename-user-name into api, web and mobile?",
  actors: ["maintainer"],
});
const merge = defineTask({
  key: "merge",
  after: [api, ...clients, approve],
  perform: (context) =>
    [api, ...clients].map((task) => {
      const { repository, branch } = context.value(task);
      execFileSync("git", ["-C", repository, "merge", "--ff-only", branch]);
      return repository;
    }),
});

const workflow = defineWorkflow("rename-user-name", [
  api,
  ...clients,
  approve,
  merge,
]);
const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
const command = process.argv[2];
const checkpoint = {
  store,
  runId: "rename-user-name",
  version: "1",
  ...(command === "retry" ? { resume: "retry-incomplete" as const } : {}),
};

let result = await workflow.start({
  checkpoint,
  concurrency: clients.length,
  stopOnError: false,
});
const pending = result.tasks.find((task) => task.key === "approve")?.pause;
if (pending && (command === "approve" || command === "reject"))
  result = await workflow.start({
    checkpoint,
    decisions: [
      {
        executionId: result.executionId,
        key: "approve",
        requestId: pending.id,
        actor: "maintainer",
        reason: "Reviewed the three branches",
        action: command,
      },
    ],
  });
console.log(result.status);
for (const task of result.tasks)
  console.log(task.key, task.status, task.error ?? "");
```

```sh
node rename-field.mts
```

Le script affiche `paused` : les trois branches existent et attendent une relecture. Examinez `outpost/rename-user-name` dans chaque checkout, puis décidez.

```sh
node rename-field.mts approve
```

Le script affiche `done`. Les branches sont fusionnées dans la branche courante de chaque checkout, l’API en premier. Rien n’est poussé.

## Comment ça marche

Chaque lien indique qui transmet quoi à qui, dans le sens de la flèche.

<!-- canvas -->

- [Votre script](../durable-runs/): `rename-field.mts` démarre l’exécution, puis la reprend avec `approve` ou `reject`.
  - hôte
  - → **api**: `workflow.start()`
  - → **approve**: décision
- [api](../typed-responses/): Renomme d’abord le champ et rend `{ from, to, notes }`, vérifié par `defineJsonResponse()`.
  - workflow
  - → **API**: brief
  - → **Clients**: le changement
- [Clients](../concurrency-and-retries/): Les deux s’exécutent en même temps, avec `concurrency: 2`.
  - workflow
  - **web**: le changement de l’API dans son brief
    - → **Web**: brief
  - **mobile**: le changement de l’API dans son brief
    - → **Mobile**: brief
  - → **approve**: trois branches
- [approve](../approvals/): `defineApprovalTask()` enregistre la demande et termine le processus en `paused`.
  - workflow
  - → **merge**: approuvé
- **merge**: Avance chaque checkout jusqu’à sa branche, l’API d’abord.
  - workflow
  - → **Checkouts**: `git merge --ff-only`
- [Sandboxes](../multiple-repositories/): Une par dépôt, chacune sur `outpost/rename-user-name`.
  - sandbox
  - **API**: `/projects/api`
  - **Web**: `/projects/web`
  - **Mobile**: `/projects/mobile`
  - → **Checkouts**: commits sur chaque branche
- **Checkouts**: Vos trois dépôts. Rien n’est poussé.
  - hôte

Un checkpoint ne contient que du JSON. Chaque tâche du workflow appelle donc le `perform()` de sa tâche isolée et garde `repository`, `branch` et `commits`, pas le résultat du dispatch.

## Quand un dépôt échoue

Chaque dépôt a sa branche et son historique : rien ne les relie. Par défaut, un échec annule les tâches en cours ; `stopOnError: false` laisse l’autre client terminer.

| Ce que vous voyez                                       | Que faire                                                                                             |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `api` `failed`, clients `skipped`                       | Lisez `task.error`, corrigez la cause, lancez `node rename-field.mts retry`.                          |
| Un client `failed`, l’autre `done`                      | `retry` relance seulement le client en échec, sur la même branche. Les autres viennent du checkpoint. |
| `approve` `rejected`, `merge` `skipped`                 | Les branches restent. Reprenez-les, puis démarrez une nouvelle exécution avec un autre `runId`.       |
| `merge` `failed` après la fusion des premiers checkouts | Mettez à jour la branche bloquée, puis `retry` : les branches déjà fusionnées ne changent rien.       |

:::caution
Rien n’annule la branche de l’API quand un client échoue. Une tâche en échec conserve son worktree : voir [Récupérer du travail](../recovery/). `retry` autorise à rejouer les tâches inachevées et leurs effets de bord : voir [Exécutions durables](../durable-runs/).
:::

## L’adapter

### Ajouter des dépôts

Ajoutez une entrée à `clients`, par exemple `client("cli", "/projects/cli")`. L’approbation, la fusion et `concurrency` suivent la liste.

### Utiliser des sandboxes cloud

Remplacez `sandboxProvider` par un provider de [Sandboxes cloud](../cloud-sandboxes/). Chaque tâche envoie son dépôt, et les commits de l’agent reviennent dans le checkout de l’hôte avant l’exécution de `merge`.

### Relire avant l’approbation

Insérez une tâche de relecture en lecture seule par client, entre les clients et `approve`, et ajoutez les relectures au `after` de la gate.

```ts
import {
  defineIsolatedTask,
  defineTask,
  defineTextResponse,
} from "@elie-laloum/outpost";
import type { Task } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.mts";

export function review(change: Task<{ repository: string; branch: string }>) {
  const agent = defineIsolatedTask({
    key: `${change.key}-review-agent`,
    request: (context) => ({
      repository: context.value(change).repository,
      sandboxProvider,
      agent: coder,
      branch: { mode: "named", name: context.value(change).branch },
      response: defineTextResponse({ tag: "review" }),
      brief: {
        text: "Review the last commits on this branch without editing files. Answer in <review></review>.",
      },
    }),
  });
  return defineTask({
    key: `${change.key}-review`,
    after: [change],
    perform: async (context) => (await agent.perform(context)).value,
  });
}
```

L’exécution en pause contient alors chaque relecture : lisez-la avec `result.value(task)` avant de décider.

API : [defineIsolatedTask](../../reference/defineisolatedtask/) · [defineJsonResponse](../../reference/definejsonresponse/) · [defineApprovalTask](../../reference/defineapprovaltask/) · [WorkflowOptions](../../reference/workflowoptions/) · [WorkflowCheckpointOptions](../../reference/workflowcheckpointoptions/).
