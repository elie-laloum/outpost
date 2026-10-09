---
title: "Examiner une pull request à la demande"
description: "Utilisez un webhook vérifié pour mettre en file une revue par un agent lorsqu’un label est ajouté."
---

Enregistrez le script à côté de la configuration de la page [Installation](../setup/) et lancez-le avec Node.js. Il reçoit les événements de label vérifiés et publie des jobs de revue ; le worker exécute l’agent séparément.

## Ce que montre l’exemple

<!-- features -->

- [Webhooks](../webhooks/): Vérifier la livraison et transformer l’événement de label en job.
- [Files de jobs et workers](../job-queues/): Transmettre le job du serveur à un processus worker.
- [Exécutions durables](../durable-runs/): Enregistrer la sortie de chaque tâche sous le `runId` du job.
- [Tâches et dépendances](../task-dependencies/): Récupérer, relire, puis publier.
- [Réponses typées](../typed-responses/): Valider le verdict de l’agent.
- [Dépôt et branche](../workspaces/): Faire partir la branche de revue du commit de tête de la pull request.

## Écrire le script

Enregistrez les fichiers présentés dans les onglets dans le même répertoire, à côté du `outpost.config.ts` de la page [Installation](../setup/). Lancez le serveur HTTP avec `server.ts` et le worker avec `worker.ts`. Le `repository` de la configuration est un clone local du dépôt GitHub relu.

<!-- tabs -->

```ts title="webhook-source.ts"
import { createGithubWebhook } from "@elie-laloum/outpost";

export const secret = process.env.GITHUB_WEBHOOK_SECRET;
if (!secret) throw new Error("Set GITHUB_WEBHOOK_SECRET");
export const reviewers = new Set(["github:octocat"]);
export const source = createGithubWebhook({ secret });
```

```ts title="payload-field.ts"
import type { WorkflowJson } from "@elie-laloum/outpost";

export function field(value: WorkflowJson | undefined, ...path: string[]) {
  for (const key of path) {
    if (typeof value !== "object" || value === null) return undefined;
    value = Object.entries(value).find(([name]) => name === key)?.[1];
  }
  return value;
}
```

```ts title="pull-commits.ts"
import type { WorkflowJson } from "@elie-laloum/outpost";
import { field } from "./payload-field.ts";

export function commits(payload: WorkflowJson) {
  const base = field(payload, "pull_request", "base", "sha");
  const head = field(payload, "pull_request", "head", "sha");
  if (typeof base !== "string" || typeof head !== "string") return undefined;
  return { base, head };
}
```

```ts title="review-trigger.ts"
import type { TriggerRoute } from "@elie-laloum/outpost";
import { labelAdded } from "@elie-laloum/outpost";
import { reviewers } from "./webhook-source.ts";
import { commits } from "./pull-commits.ts";

export const on: TriggerRoute["on"] = (event) => {
  const pull = labelAdded(event, "outpost:review");
  if (pull?.target !== "pull-request") return undefined;
  if (!event.actor || !reviewers.has(event.actor)) return undefined;
  const change = commits(event.payload);
  if (!change) return undefined;
  return {
    handler: "review",
    runId: `review:${pull.repository}#${pull.number}@${change.head}`,
    input: { repository: pull.repository, number: pull.number, ...change },
  };
};
```

```ts title="server.ts"
import { reportValue } from "./reporter.ts";
import { createSqliteTaskQueue, serveTriggers } from "@elie-laloum/outpost";
import { source } from "./webhook-source.ts";
import { on } from "./review-trigger.ts";

export const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
export const server = await serveTriggers({
  queue,
  port: 8787,
  routes: [{ path: "/github", source, on }],
  onError: (error, failure) => console.error(failure, error),
});
reportValue(`Listening on ${server.url}/github`);
// Example output: Listening on http://127.0.0.1:8787/github
process.once("SIGINT", async () => {
  await server.close();
  queue.close();
});
```

Validez les données du job et le verdict, puis fournissez les opérations GitHub de votre application.

Le schéma explicite de `verdict-schema.ts` décrit le JSON d’entrée injecté dans le prompt ; `verdict.ts` valide la réponse reçue.

```ts title="verdict-schema.ts"
export const verdictSchema = {
  type: "object",
  properties: {
    approved: { type: "boolean" },
    findings: { type: "array", items: { type: "string" } },
  },
  required: ["approved", "findings"],
};
```

Importez ce schéma dans `verdict.ts` pour que les consignes automatiques décrivent la réponse attendue ; la fonction de validation existante continue de vérifier son contenu.

<!-- tabs -->

```ts title="review.types.ts"
export type PullRequest = {
  repository: string;
  number: number;
  base: string;
  head: string;
};
export type Verdict = { approved: boolean; findings: string[] };
```

```ts title="verdict.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";
import { verdictSchema } from "./verdict-schema.ts";
import type { Verdict } from "./review.types.ts";

export const verdict = defineJsonResponse({
  tag: "verdict",
  jsonSchema: verdictSchema,
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
```

```ts title="read-pull.ts"
import type { WorkflowJson } from "@elie-laloum/outpost";
import type { PullRequest } from "./review.types.ts";

export function readPullRequest(input: WorkflowJson): PullRequest {
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
```

```ts title="github-effects.ts"
import type { PullRequest, Verdict } from "./review.types.ts";
import { repository } from "./outpost.config.ts";

export async function fetchCommits(pull: PullRequest): Promise<void> {
  throw new Error(`Fetch ${pull.base} and ${pull.head} into ${repository}`);
}
export async function postVerdict(
  pull: PullRequest,
  result: Verdict,
  idempotencyKey: string,
): Promise<void> {
  throw new Error(`Post ${result.approved} on #${pull.number}`);
}
```

```ts title="pull-brief.ts"
import type { PullRequest } from "./review.types.ts";

export function pullBrief(pull: PullRequest) {
  return {
    text: [
      `Review pull request #${pull.number}: git diff ${pull.base}...HEAD.`,
      "Do not edit files. Report each problem as path:line: message.",
      'End with <verdict>{"approved": true, "findings": []}</verdict>.',
    ].join("\n"),
  };
}
```

Lancez la revue sur le commit demandé et publiez le verdict avec des tâches dépendantes.

<!-- tabs -->

```ts title="pull-request.ts"
import type { PullRequest } from "./review.types.ts";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";
import { verdict } from "./verdict.ts";
import { pullBrief } from "./pull-brief.ts";

export function reviewRequest(pull: PullRequest) {
  return {
    repository,
    sandboxProvider,
    agent: coder,
    branch: {
      mode: "named",
      name: `outpost/review-${pull.number}-${pull.head.slice(0, 12)}`,
      from: pull.head,
    } as const,
    response: verdict,
    brief: pullBrief(pull),
  };
}
```

```ts title="pull-agent.ts"
import type { PullRequest } from "./review.types.ts";
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { reviewRequest } from "./pull-request.ts";

export function reviewAgent(pull: PullRequest) {
  return defineIsolatedTask({
    key: "review-agent",
    request: () => reviewRequest(pull),
  });
}
```

```ts title="pull-review.ts"
import type { PullRequest } from "./review.types.ts";
import type { Task } from "@elie-laloum/outpost";
import { reviewAgent } from "./pull-agent.ts";
import { defineTask } from "@elie-laloum/outpost";

export function reviewTask(pull: PullRequest, fetch: Task<void>) {
  const agent = reviewAgent(pull);
  return defineTask({
    key: "review",
    after: [fetch],
    perform: async (context) => (await agent.perform(context)).value,
  });
}
```

```ts title="post-review.ts"
import type { PullRequest } from "./review.types.ts";
import { reviewTask } from "./pull-review.ts";
import { defineTask } from "@elie-laloum/outpost";
import { postVerdict } from "./github-effects.ts";

export function postTask(
  pull: PullRequest,
  review: ReturnType<typeof reviewTask>,
) {
  return defineTask({
    key: "post",
    after: [review],
    perform: (context) =>
      postVerdict(pull, context.value(review), context.idempotencyKey),
  });
}
```

```ts title="review-workflow.ts"
import type { PullRequest } from "./review.types.ts";
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";
import { fetchCommits } from "./github-effects.ts";
import { reviewTask } from "./pull-review.ts";
import { postTask } from "./post-review.ts";

export function reviewWorkflow(pull: PullRequest) {
  const fetch = defineTask({ key: "fetch", perform: () => fetchCommits(pull) });
  const review = reviewTask(pull, fetch);
  const post = postTask(pull, review);
  return defineWorkflow("review-pull-request", [fetch, review, post]);
}
```

Enregistrez l’état du workflow et lancez le worker.

<!-- tabs -->

```ts title="review-job.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
  defineWorkflowJob,
} from "@elie-laloum/outpost";
import { reviewWorkflow } from "./review-workflow.ts";
import { readPullRequest } from "./read-pull.ts";

export const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
export const job = defineWorkflowJob({
  checkpoint: { store, version: "1" },
  workflow: (input) => reviewWorkflow(readPullRequest(input)),
});
```

```ts title="worker.ts"
import { createSqliteTaskQueue, runQueueWorker } from "@elie-laloum/outpost";
import { job } from "./review-job.ts";

export const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
export const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "reviewer-1",
    signal: stop.signal,
    handlers: { review: job },
  });
} finally {
  queue.close();
}
```

### Exécuter le script

Lancez le serveur HTTP et le worker dans deux terminaux distincts. Fournissez au serveur le secret du webhook configuré dans GitHub ; le worker traite les jobs de revue que le serveur publie.

```sh
GITHUB_WEBHOOK_SECRET=… node server.ts
node worker.ts
```

Pointez le webhook du dépôt vers le chemin `/github` du serveur, derrière un proxy HTTPS, avec le même secret et l’événement « Pull requests ».

## Comprendre les étapes

Chaque lien indique qui transmet quoi à qui, dans le sens de la flèche.

<!-- canvas -->

- **GitHub**: Envoie une livraison signée quand un label est posé sur une pull request, et attend la réponse 10 secondes.
  - GitHub
  - → **Serveur**: webhook
- [Serveur](../webhooks/): `serveTriggers()` vérifie la signature (`401` sinon), le label `outpost:review` et l’acteur dans `reviewers`.
  - hôte
  - → **File**: job `review`
- [File](../job-queues/): `.outpost/jobs.sqlite`, partagée par le serveur et le worker.
  - hôte
  - → **Worker**: prise en charge
- [Worker](../job-queues/): `runQueueWorker()` prend le job ; `defineWorkflowJob()` exécute le workflow sous son `runId`.
  - hôte
  - → **fetch**: démarrage
  - → **Checkpoint**: sorties des tâches
- [Workflow](../task-dependencies/): Trois tâches, l’une après l’autre.
  - workflow
  - **fetch**: votre code apporte les commits de base et de tête dans le clone
  - **review**: `defineIsolatedTask()` sur une branche au commit de tête
    - → **Sandbox**: brief
  - **post**: votre code publie le verdict, dédupliqué par `context.idempotencyKey`
    - → **GitHub**: verdict
- [Sandbox](../choose-a-sandbox/): L’agent lit le diff de la pull request, pas votre checkout.
  - sandbox
  - → **review**: `{ approved, findings }` vérifié
- [Checkpoint](../durable-runs/): Le même label sur le même commit restaure l’exécution terminée.
  - hôte

Le `runId` nomme le commit de tête. Rajouter le label sur le même commit restaure l’exécution terminée depuis son checkpoint : rien n’est relu ni publié deux fois. Un nouveau commit lance une nouvelle revue.

`review` ne renvoie que `.value` : les checkpoints contiennent du JSON, pas les méthodes d’un résultat de dispatch ([D’une tâche à un workflow](../first-workflow/)).

## Adapter l’exemple

### Merge requests GitLab

Ajoutez une route `/gitlab` avec `createGitlabWebhook({ signingToken })`, qui vérifie un corps signé. `labelAdded()` reconnaît aussi les merge requests : lisez la tête dans `object_attributes.last_commit.id`, la base dans `object_attributes.target_branch`, et listez des acteurs `gitlab:<username>` dans `reviewers`.

### Une commande Slack

Ajoutez une route `/slack` avec `createSlackSource({ signingSecret })` et `commandIssued(event, "/review")`, dont le `text` désigne la pull request. Slack ne transmet aucun commit : publiez `{ repository, number }` et laissez `fetch` renvoyer `{ base, head }`, que `review` lira.

### Une file Redis

Remplacez `createSqliteTaskQueue()` dans la configuration de la file par [`createBullMQTaskQueue()`](../redis-workers/) pour exécuter le serveur et les workers sur des machines distinctes. Plusieurs machines de workers demandent aussi un stockage de checkpoints partagé ([S3 et R2](../object-storage/)).

### Approuver avant de publier

Insérez une [étape d’approbation](../approvals/) entre `review` et `post`. Le job se termine alors en `paused`, avec l’étape d’approbation en attente dans sa valeur ; soumettez la décision à la même exécution comme dans [Files de jobs et workers](../job-queues/).

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
