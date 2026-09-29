---
title: "Relire une pull request à la demande"
description: "Lancer une revue par un agent quand un label est ajouté à une pull request, puis publier son verdict typé depuis votre propre code."
---

Un mainteneur ajoute le label `outpost:review` à une pull request GitHub. Un serveur de webhooks met la demande en file ; un worker fait relire le commit de tête par un agent, dans sa propre sandbox, et renvoie `{ approved, findings }` au code qui le publie.

## Ce que vous utilisez

<!-- features -->

- [Webhooks](../webhooks/): Vérifier la livraison et transformer l’événement de label en job.
  - `serveTriggers()`
  - `createGithubWebhook()`
  - `labelAdded()`
- [Files de jobs et workers](../job-queues/): Transmettre le job du serveur à un processus worker.
  - `createSqliteTaskQueue()`
  - `runQueueWorker()`
  - `defineWorkflowJob()`
- [Exécutions persistantes](../durable-runs/): Enregistrer la sortie de chaque tâche sous le `runId` du job.
  - `createWorkflowCheckpointStore()`
- [Tâches et dépendances](../task-dependencies/): Récupérer, relire, puis publier.
  - `defineTask()`
  - `defineIsolatedTask()`
- [Réponses typées](../typed-responses/): Valider le verdict de l’agent.
  - `defineJsonResponse()`
- [Dépôt et branche](../repository-and-branch/): Faire partir la branche de revue du commit de tête de la pull request.
  - `named`
  - `from`

## Le code

Lancez les deux fichiers depuis le même répertoire, à côté du `outpost.config.mts` d’[Installation](../setup/). Son `repository` est un clone local du dépôt GitHub relu.

```ts title="server.mts"
import {
  createGithubWebhook,
  createSqliteTaskQueue,
  labelAdded,
  serveTriggers,
} from "@elie-laloum/outpost";
import type { WorkflowJson } from "@elie-laloum/outpost";

const secret = process.env.GITHUB_WEBHOOK_SECRET;
if (!secret) throw new Error("Set GITHUB_WEBHOOK_SECRET");
const reviewers = new Set(["github:octocat"]);

// Lit une valeur imbriquée du payload du webhook.
function field(value: WorkflowJson | undefined, ...path: string[]) {
  for (const key of path) {
    if (typeof value !== "object" || value === null) return undefined;
    value = Object.entries(value).find(([name]) => name === key)?.[1];
  }
  return value;
}

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const server = await serveTriggers({
  queue,
  port: 8787,
  routes: [
    {
      path: "/github",
      source: createGithubWebhook({ secret }),
      on(event) {
        const pull = labelAdded(event, "outpost:review");
        if (pull?.target !== "pull-request") return undefined;
        if (!event.actor || !reviewers.has(event.actor)) return undefined;
        const base = field(event.payload, "pull_request", "base", "sha");
        const head = field(event.payload, "pull_request", "head", "sha");
        if (typeof base !== "string" || typeof head !== "string")
          return undefined;
        return {
          handler: "review",
          runId: `review:${pull.repository}#${pull.number}@${head}`,
          input: {
            repository: pull.repository,
            number: pull.number,
            base,
            head,
          },
        };
      },
    },
  ],
  onError: (error, failure) => console.error(failure, error),
});
console.log(`Listening on ${server.url}/github`);
process.once("SIGINT", async () => {
  await server.close();
  queue.close();
});
```

```ts title="worker.mts"
import {
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
import type { WorkflowJson } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

type PullRequest = {
  repository: string;
  number: number;
  base: string;
  head: string;
};
type Verdict = { approved: boolean; findings: string[] };

const verdict = defineJsonResponse({
  tag: "verdict",
  repairs: 1,
  schema(value): Verdict {
    if (typeof value !== "object" || value === null)
      throw new Error("Expected an object");
    if (!("approved" in value) || typeof value.approved !== "boolean")
      throw new Error("Expected approved: boolean");
    if (!("findings" in value) || !Array.isArray(value.findings))
      throw new Error("Expected findings: string[]");
    if (!value.findings.every((item) => typeof item === "string"))
      throw new Error("Expected findings: string[]");
    return { approved: value.approved, findings: value.findings };
  },
});

function readPullRequest(input: WorkflowJson): PullRequest {
  if (typeof input !== "object" || input === null || Array.isArray(input))
    throw new Error("Expected a pull request");
  const { repository, number, base, head } = input as {
    readonly [key: string]: WorkflowJson;
  };
  if (
    typeof repository !== "string" ||
    typeof number !== "number" ||
    typeof base !== "string" ||
    typeof head !== "string"
  )
    throw new Error("Expected { repository, number, base, head }");
  return { repository, number, base, head };
}

function reviewWorkflow(pull: PullRequest) {
  const fetch = defineTask({ key: "fetch", perform: () => fetchCommits(pull) });
  const agent = defineIsolatedTask({
    key: "review-agent",
    request: () => ({
      repository,
      sandboxProvider,
      agent: coder,
      branch: {
        mode: "named",
        name: `outpost/review-${pull.number}-${pull.head.slice(0, 12)}`,
        from: pull.head,
      },
      response: verdict,
      brief: {
        text: [
          `Review pull request #${pull.number}: git diff ${pull.base}...HEAD.`,
          "Do not edit files. Report each problem as path:line: message.",
          'End with <verdict>{"approved": true, "findings": []}</verdict>.',
        ].join("\n"),
      },
    }),
  });
  const review = defineTask({
    key: "review",
    after: [fetch],
    perform: async (context) => (await agent.perform(context)).value,
  });
  const post = defineTask({
    key: "post",
    after: [review],
    perform: (context) =>
      postVerdict(pull, context.value(review), context.idempotencyKey),
  });
  return defineWorkflow("review-pull-request", [fetch, review, post]);
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
    worker: "reviewer-1",
    signal: stop.signal,
    handlers: {
      review: defineWorkflowJob({
        checkpoint: { store, version: "1" },
        workflow: (input) => reviewWorkflow(readPullRequest(input)),
      }),
    },
  });
} finally {
  queue.close();
}

// Votre code : rendre pull.base et pull.head disponibles dans le clone local,
// par exemple avec `git fetch origin pull/<number>/head`.
async function fetchCommits(pull: PullRequest): Promise<void> {
  throw new Error(`Fetch ${pull.base} and ${pull.head} into ${repository}`);
}

// Votre code : publier le verdict sur GitHub, dédupliqué par idempotencyKey.
async function postVerdict(
  pull: PullRequest,
  result: Verdict,
  idempotencyKey: string,
): Promise<void> {
  throw new Error(`Post ${result.approved} on #${pull.number}`);
}
```

```sh
GITHUB_WEBHOOK_SECRET=… node server.mts
node worker.mts
```

Pointez le webhook du dépôt vers le chemin `/github` du serveur, derrière un proxy HTTPS, avec le même secret et l’événement « Pull requests ».

## Comment ça marche

<!-- flow -->

1. **Recevoir**: Le serveur répond à GitHub dans sa limite de 10 secondes.
   - **Vérifier**: La signature doit correspondre au secret du webhook, sinon `401`.
     - `createGithubWebhook()`
   - **Filtrer**: Garder un nouveau label `outpost:review` sur une pull request, ajouté par une personne de `reviewers`.
     - `labelAdded()`
     - `event.actor`
   - **Publier**: Mettre en file un job `review` dont l’entrée porte le dépôt, le numéro et les commits de base et de tête.
     - `serveTriggers()`
2. **Exécuter**: Le worker prend le job dans son propre processus.
   - **Réclamer**: Prendre le job dans le fichier SQLite partagé.
     - `runQueueWorker()`
   - **Checkpoint**: Démarrer le workflow sous le `runId` du job.
     - `defineWorkflowJob()`
3. **Relire**: L’agent lit la pull request, pas votre checkout.
   - **fetch**: Votre code amène les deux commits dans le clone local.
     - host
   - **review**: L’agent travaille sur une branche au commit de tête, dans sa propre sandbox, et renvoie un verdict validé.
     - `defineIsolatedTask()`
     - sandbox
4. **Livrer**: Le verdict sort d’Outpost par votre code.
   - **post**: Votre code publie le verdict, avec la clé `context.idempotencyKey`.
     - `defineTask()`
     - host

Le `runId` nomme le commit de tête. Rajouter le label sur le même commit restaure l’exécution terminée depuis son checkpoint : rien n’est relu ni publié deux fois. Un nouveau commit lance une nouvelle revue.

`review` ne renvoie que `.value` : les checkpoints contiennent du JSON, pas les méthodes d’un résultat de dispatch ([D’une tâche à un workflow](../first-workflow/)).

## L’adapter

### Merge requests GitLab

Ajoutez une route `/gitlab` avec `createGitlabWebhook({ signingToken })`, qui vérifie un corps signé. `labelAdded()` reconnaît aussi les merge requests : lisez la tête dans `object_attributes.last_commit.id`, la base dans `object_attributes.target_branch`, et listez des acteurs `gitlab:<username>` dans `reviewers`.

### Une commande Slack

Ajoutez une route `/slack` avec `createSlackSource({ signingSecret })` et `commandIssued(event, "/review")`, dont le `text` désigne la pull request. Slack ne transmet aucun commit : publiez `{ repository, number }` et laissez `fetch` renvoyer `{ base, head }`, que `review` lira.

### Une file Redis

Remplacez `createSqliteTaskQueue()` dans les deux fichiers par [`createBullMQTaskQueue()`](../redis-workers/) pour exécuter le serveur et les workers sur des machines distinctes. Plusieurs machines de workers demandent aussi un stockage de checkpoints partagé ([S3 et R2](../object-storage/)).

### Approuver avant de publier

Insérez une [gate d’approbation](../approvals/) entre `review` et `post`. Le job se termine alors en `paused`, avec la gate en attente dans sa valeur ; soumettez la décision à la même exécution comme dans [Files de jobs et workers](../job-queues/).

```ts
import { defineApprovalTask, defineTask } from "@elie-laloum/outpost";
import type { Task } from "@elie-laloum/outpost";

type Verdict = { approved: boolean; findings: string[] };
declare const review: Task<Verdict>;
declare function postVerdict(verdict: Verdict, key: string): Promise<void>;

const approve = defineApprovalTask({
  key: "approve",
  after: [review],
  prompt: "Post the agent's review?",
  actors: ["maintainer"],
});
const post = defineTask({
  key: "post",
  after: [review, approve],
  perform: (context) =>
    postVerdict(context.value(review), context.idempotencyKey),
});
```

## Limites

- Le worker relit le clone désigné par `repository` ; associez `pull.repository` à un clone pour servir plusieurs dépôts.
- « Do not edit files » est une instruction donnée à l’agent. Sa branche de revue n’est jamais intégrée ni poussée ; supprimez les branches `outpost/review-*` dont vous n’avez plus besoin.
- Un worker interrompu peut réexécuter `post` : faites dédupliquer `postVerdict` sur sa clé ([Files de jobs et workers](../job-queues/)).

API : [serveTriggers](../../reference/servetriggers/) · [createGithubWebhook](../../reference/creategithubwebhook/) · [labelAdded](../../reference/labeladded/) · [createSqliteTaskQueue](../../reference/createsqlitetaskqueue/) · [runQueueWorker](../../reference/runqueueworker/) · [defineWorkflowJob](../../reference/defineworkflowjob/) · [defineIsolatedTask](../../reference/defineisolatedtask/) · [defineJsonResponse](../../reference/definejsonresponse/).
