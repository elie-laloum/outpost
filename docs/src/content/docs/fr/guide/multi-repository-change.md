---
title: "Coordonner une modification entre dépôts"
description: "Modifiez une API et ses clients, examinez chaque branche et approuvez leur intégration."
---

## Ce que montre l’exemple

<!-- features -->

- [Plusieurs dépôts](../multiple-repositories/): Une tâche par checkout, chacune avec sa sandbox et sa branche.
- [Réponses typées](../typed-responses/): L’agent de l’API renvoie une description validée de sa modification.
- [Tâches et dépendances](../task-dependencies/): Les clients démarrent après l’API et lisent son résultat.
- [Concurrence, relances et délais](../concurrency-and-retries/): Les deux clients s’exécutent en même temps.
- [Approbations](../approvals/): Un mainteneur décide avant toute fusion.
- [Exécutions durables](../durable-runs/): Le checkpoint conserve le travail terminé d’une exécution à l’autre.

## Écrire le script

Enregistrez le script à côté de la configuration de la page [Installation](../setup/), puis remplacez les trois chemins par ceux de vos dépôts. Chaque dépôt dispose d’une branche séparée ; une approbation contrôle les étapes d’intégration.

Définissez la modification de l’API et le résultat que recevront les clients.

<!-- tabs -->

```ts title="delivery.ts"
import type { DispatchResult } from "@elie-laloum/outpost";

export const branch = {
  mode: "named",
  name: "outpost/rename-user-name",
} as const;
export const delivery = (
  repository: string,
  result: DispatchResult<unknown>,
) => ({
  repository,
  branch: result.branch,
  commits: result.commits,
});
```

```ts title="rename-contract.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";

export const rename = defineJsonResponse({
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
```

```ts title="api-brief.ts"
export const apiBrief = {
  text: `Rename the user_name field of GET /users to username.\nUpdate the handlers, the OpenAPI schema and the tests, run the tests and commit.\nFinish with <rename>{"from":"<old>","to":"<new>","notes":"<what clients must change>"}</rename>.`,
};
```

```ts title="api-agent.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { sandboxProvider, coder } from "./outpost.config.ts";
import { branch } from "./delivery.ts";
import { rename } from "./rename-contract.ts";
import { apiBrief } from "./api-brief.ts";

export const apiAgent = defineIsolatedTask({
  key: "api-agent",
  request: () => ({
    repository: "/projects/api",
    sandboxProvider,
    agent: coder,
    branch,
    response: rename,
    brief: apiBrief,
  }),
});
```

```ts title="api.ts"
import { defineTask } from "@elie-laloum/outpost";
import { apiAgent } from "./api-agent.ts";
import { delivery } from "./delivery.ts";

export const api = defineTask({
  key: "api",
  perform: async (context) => {
    const result = await apiAgent.perform(context);
    return { ...delivery("/projects/api", result), change: result.value };
  },
});
```

Mettez à jour les clients, attendez l’approbation, puis intégrez explicitement chaque branche.

<!-- tabs -->

```ts title="client-request.ts"
import type { TaskContext } from "@elie-laloum/outpost";
import { api } from "./api.ts";
import { sandboxProvider, coder } from "./outpost.config.ts";
import { branch } from "./delivery.ts";

export function clientRequest(repository: string, context: TaskContext) {
  const { change } = context.value(api);
  return {
    repository,
    sandboxProvider,
    agent: coder,
    branch,
    brief: {
      text: `The API renamed ${change.from} to ${change.to}. ${change.notes}\nUpdate this client, run its tests and commit.`,
    },
  };
}
```

```ts title="client.ts"
import { defineIsolatedTask, defineTask } from "@elie-laloum/outpost";
import { clientRequest } from "./client-request.ts";
import { api } from "./api.ts";
import { delivery } from "./delivery.ts";

export function client(key: string, repository: string) {
  const agent = defineIsolatedTask({
    key: `${key}-agent`,
    request: (context) => clientRequest(repository, context),
  });
  return defineTask({
    key,
    after: [api],
    perform: async (context) =>
      delivery(repository, await agent.perform(context)),
  });
}
```

```ts title="clients.ts"
import { client } from "./client.ts";

export const clients = [
  client("web", "/projects/web"),
  client("mobile", "/projects/mobile"),
];
```

```ts title="approval.ts"
import { defineApprovalTask } from "@elie-laloum/outpost";
import { api } from "./api.ts";
import { clients } from "./clients.ts";

export const approve = defineApprovalTask({
  key: "approve",
  after: [api, ...clients],
  prompt: "Merge outpost/rename-user-name into api, web and mobile?",
  actors: ["maintainer"],
});
```

```ts title="merge.ts"
import { defineTask } from "@elie-laloum/outpost";
import { api } from "./api.ts";
import { clients } from "./clients.ts";
import { approve } from "./approval.ts";
import { execFileSync } from "node:child_process";

export const merge = defineTask({
  key: "merge",
  after: [api, ...clients, approve],
  perform: (context) =>
    [api, ...clients].map((task) => {
      const { repository, branch } = context.value(task);
      execFileSync("git", ["-C", repository, "merge", "--ff-only", branch]);
      return repository;
    }),
});
```

Enregistrez l’exécution dans un checkpoint et utilisez `rename-field.ts` pour la démarrer ou la reprendre.

<!-- tabs -->

```ts title="rename-workflow.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { api } from "./api.ts";
import { clients } from "./clients.ts";
import { approve } from "./approval.ts";
import { merge } from "./merge.ts";

export const workflow = defineWorkflow("rename-user-name", [
  api,
  ...clients,
  approve,
  merge,
]);
```

```ts title="rename-checkpoint.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
} from "@elie-laloum/outpost";

export const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
export const command = process.argv[2];
export const checkpoint = {
  store,
  runId: "rename-user-name",
  version: "1",
  ...(command === "retry" ? { resume: "retry-incomplete" as const } : {}),
};
```

```ts title="merge-decision.ts"
import type { WorkflowDecision } from "@elie-laloum/outpost";

export function mergeDecision(
  executionId: string,
  requestId: string,
  action: "approve" | "reject",
): WorkflowDecision {
  return {
    executionId,
    key: "approve",
    requestId,
    actor: "maintainer",
    reason: "Reviewed the three branches",
    action,
  };
}
```

```ts title="rename-result.ts"
import { reportValue } from "./reporter.ts";
import type { WorkflowResult } from "@elie-laloum/outpost";

export function showRun(result: WorkflowResult) {
  reportValue(result.status);
  // Example output: done
  for (const task of result.tasks)
    reportValue(task.key, task.status, task.error ?? "");
  // Example output: api done
}
```

```ts title="rename-field.ts"
import { workflow } from "./rename-workflow.ts";
import { checkpoint, command } from "./rename-checkpoint.ts";
import { clients } from "./clients.ts";
import { mergeDecision } from "./merge-decision.ts";
import { showRun } from "./rename-result.ts";

export let result = await workflow.start({
  checkpoint,
  concurrency: clients.length,
  stopOnError: false,
});
export const pending = result.tasks.find(
  (task) => task.key === "approve",
)?.pause;
if (pending && (command === "approve" || command === "reject"))
  result = await workflow.start({
    checkpoint,
    decisions: [mergeDecision(result.executionId, pending.id, command)],
  });
showRun(result);
```

### Exécuter le script

Lancez le script principal pour créer les branches et attendre à l’étape d’approbation. Les modifications restent disponibles pour relecture dans chaque dépôt.

```sh
node rename-field.ts
```

Le script affiche `paused` : les trois branches existent et attendent une relecture. Examinez `outpost/rename-user-name` dans chaque checkout, puis décidez.

```sh
node rename-field.ts approve
```

Le script affiche `done`. Les branches sont fusionnées dans la branche courante de chaque checkout, l’API en premier. Rien n’est poussé.

## Comprendre les étapes

Chaque lien indique qui transmet quoi à qui, dans le sens de la flèche.

<!-- canvas -->

- [Votre script](../durable-runs/): `rename-field.ts` démarre l’exécution, puis la reprend avec `approve` ou `reject`.
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
| `api` `failed`, clients `skipped`                       | Lisez `task.error`, corrigez la cause, lancez `node rename-field.ts retry`.                           |
| Un client `failed`, l’autre `done`                      | `retry` relance seulement le client en échec, sur la même branche. Les autres viennent du checkpoint. |
| `approve` `rejected`, `merge` `skipped`                 | Les branches restent. Reprenez-les, puis démarrez une nouvelle exécution avec un autre `runId`.       |
| `merge` `failed` après la fusion des premiers checkouts | Mettez à jour la branche bloquée, puis `retry` : les branches déjà fusionnées ne changent rien.       |

:::caution
Rien n’annule la branche de l’API quand un client échoue. Une tâche en échec conserve son worktree : voir [Récupérer du travail](../recovery/). `retry` autorise à rejouer les tâches inachevées et leurs effets de bord : voir [Exécutions durables](../durable-runs/).
:::

## Adapter l’exemple

### Ajouter des dépôts

Ajoutez une entrée à `clients`, par exemple `client("cli", "/projects/cli")`. L’approbation, la fusion et `concurrency` suivent la liste.

### Utiliser des sandboxes cloud

Remplacez `sandboxProvider` par un fournisseur de [Sandboxes cloud](../cloud-sandboxes/). Chaque tâche envoie son dépôt, et les commits de l’agent reviennent dans le checkout de l’hôte avant l’exécution de `merge`.

### Relire avant l’approbation

Insérez une tâche de relecture en lecture seule par client, entre les clients et `approve`, et ajoutez les relectures au `after` de l’étape d’approbation.

<!-- tabs -->

```ts title="review-contract.ts"
import { defineTextResponse } from "@elie-laloum/outpost";

export const response = defineTextResponse({ tag: "review" });
export const brief = {
  text: "Review the last commits on this branch without editing files. Answer in <review></review>.",
};
```

```ts title="change.types.ts"
import type { Task } from "@elie-laloum/outpost";

export type ChangedRepository = Task<{ repository: string; branch: string }>;
```

```ts title="review-request.ts"
import type { ChangedRepository } from "./change.types.ts";
import type { TaskContext } from "@elie-laloum/outpost";
import { sandboxProvider, coder } from "./outpost.config.ts";
import { response, brief } from "./review-contract.ts";

export function reviewRequest(change: ChangedRepository, context: TaskContext) {
  const output = context.value(change);
  return {
    repository: output.repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: output.branch } as const,
    response,
    brief,
  };
}
```

```ts title="review-agent.ts"
import type { ChangedRepository } from "./change.types.ts";
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { reviewRequest } from "./review-request.ts";

export function reviewAgent(change: ChangedRepository) {
  return defineIsolatedTask({
    key: `${change.key}-review-agent`,
    request: (context) => reviewRequest(change, context),
  });
}
```

```ts title="review.ts"
import type { ChangedRepository } from "./change.types.ts";
import { reviewAgent } from "./review-agent.ts";
import { defineTask } from "@elie-laloum/outpost";

export function review(change: ChangedRepository) {
  const agent = reviewAgent(change);
  return defineTask({
    key: `${change.key}-review`,
    after: [change],
    perform: async (context) => (await agent.perform(context)).value,
  });
}
```

L’exécution en pause contient alors chaque relecture : lisez-la avec `result.value(task)` avant de décider.

API : [defineIsolatedTask](../../reference/defineisolatedtask/) · [defineJsonResponse](../../reference/definejsonresponse/) · [defineApprovalTask](../../reference/defineapprovaltask/) · [WorkflowOptions](../../reference/workflowoptions/) · [WorkflowCheckpointOptions](../../reference/workflowcheckpointoptions/).
