---
title: "Lancer du travail depuis des webhooks"
description: "Vérifiez les événements reçus et publiez les jobs du workflow correspondant dans une file."
---

Préparez une [file et un worker](../job-queues/) avant d’exposer un webhook. Le serveur HTTP vérifie puis met la demande en file ; il n’exécute pas l’agent. Votre application doit aussi décider quels expéditeurs vérifiés peuvent demander du travail.

## Recevoir un webhook et publier un job

Utilisez une source de webhook pour vérifier la requête reçue, puis associez l’événement accepté à un job de la file. `serveTriggers()` traite la requête HTTP ; les workers exécutent le workflow après la publication.

<!-- tabs -->

```ts title="label-job.ts"
import type { TriggerRoute } from "@elie-laloum/outpost";
import { labelAdded } from "@elie-laloum/outpost";

const allowedActors = new Set(["github:octocat"]);
export const on: TriggerRoute["on"] = (event) => {
  if (!event.actor || !allowedActors.has(event.actor)) return undefined;
  const issue = labelAdded(event, "outpost:fix");
  if (!issue) return undefined;
  return {
    handler: "fix",
    runId: `${issue.repository}#${issue.number}`,
    input: { repository: issue.repository, issue: issue.number },
  };
};
```

```ts title="github-route.ts"
import { createGithubWebhook } from "@elie-laloum/outpost";
import { on } from "./label-job.ts";

export const secret = process.env.GITHUB_WEBHOOK_SECRET;
if (!secret) throw new Error("Set GITHUB_WEBHOOK_SECRET");
export const routes = [
  { path: "/github", source: createGithubWebhook({ secret }), on },
];
```

```ts title="server.ts"
import { createSqliteTaskQueue, serveTriggers } from "@elie-laloum/outpost";
import { routes } from "./github-route.ts";

export const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
export const server = await serveTriggers({
  queue,
  port: 8787,
  routes,
  onError: (error, failure) => console.error(failure, error),
});
console.log(`Listening on ${server.url}`);
// Example output: Listening on http://127.0.0.1:8787
```

Ajouter le label `outpost:fix` à une issue ou à une pull request publie un job `fix` dans la file. Un worker l’exécute avec `defineWorkflowJob()` : voir [Files de jobs et workers](../job-queues/).

<!-- canvas -->

- **Vérifier**: Contrôler la signature avant de sélectionner le traitement.
  - Serveur HTTP
  - → **File**: événement retenu
  - → **Refus**: signature fausse
- **File**: Enregistrer un job et répondre à la requête HTTP.
  - File
  - → **Worker**: job réservé
- **Refus**: Renvoyer 401 sans publier de job.
  - Serveur HTTP
- **Worker**: Exécuter le workflow dans un autre processus.
  - Worker

Un job nomme un `handler` enregistré par le worker, un `runId` de 256 caractères au plus et un `input` JSON facultatif. Gardez `on()` rapide : GitHub attend une réponse pendant 10 secondes, Slack pendant 3 secondes.

## Vérifier une livraison locale

Définissez `GITHUB_WEBHOOK_SECRET` pour les deux processus et lancez `node server.ts`. Dans un autre terminal, exécutez `node send-webhook.ts` : vous devez obtenir `202`, puis `401`. Aucun worker n’est nécessaire pour ce contrôle ; le job reste dans la file. Remplacez `github:octocat` par les acteurs autorisés avant de connecter un dépôt réel.

```ts title="send-webhook.ts"
import { createHmac, randomUUID } from "node:crypto";

const secret = process.env.GITHUB_WEBHOOK_SECRET;
if (!secret) throw new Error("Set GITHUB_WEBHOOK_SECRET");
const body = JSON.stringify({
  action: "labeled",
  label: { name: "outpost:fix" },
  issue: { number: 42 },
  repository: { full_name: "acme/app" },
  sender: { login: "octocat" },
});
const signature = createHmac("sha256", secret).update(body).digest("hex");
for (const digest of [signature, "0".repeat(64)]) {
  const response = await fetch(
    `${process.env.WEBHOOK_URL ?? "http://127.0.0.1:8787"}/github`,
    {
      method: "POST",
      body,
      headers: {
        "content-type": "application/json",
        "x-github-event": "issues",
        "x-github-delivery": randomUUID(),
        "x-hub-signature-256": `sha256=${digest}`,
      },
    },
  );
  console.log(response.status);
}
```

## Choisir une source

| Source                                  | Vérification                                                                                  | Identifiant de livraison                       | `event.actor`       |
| --------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------- |
| `createGithubWebhook({ secret })`       | `X-Hub-Signature-256`, un HMAC du corps. Charges JSON ou formulaire.                          | `X-GitHub-Delivery`                            | `github:<login>`    |
| `createGitlabWebhook({ signingToken })` | `webhook-signature` avec un jeton de signature `whsec_` (GitLab 19.0+), fenêtre de 5 minutes. | `webhook-id`                                   | `gitlab:<username>` |
| `createGitlabWebhook({ token })`        | `X-Gitlab-Token` égal au jeton. Le corps n’est pas signé.                                     | `Idempotency-Key`, sinon `X-Gitlab-Event-UUID` | `gitlab:<username>` |
| `createSlackSource({ signingSecret })`  | `X-Slack-Signature` sur l’horodatage et le corps, fenêtre de 5 minutes.                       | `trigger_id`                                   | `slack:<user id>`   |
| `createStandardWebhook({ secret })`     | Secret `whsec_` [Standard Webhooks](https://www.standardwebhooks.com/), fenêtre de 5 minutes. | `webhook-id`                                   | aucun               |

Préférez un jeton de signature GitLab : un jeton simple circule tel quel dans un en-tête et ne signe pas le corps. `toleranceMs` modifie la fenêtre de 5 minutes. Les sources Slack acceptent les commandes slash et les charges interactives.

## Lire l’événement

Deux fonctions utilitaires reconnaissent les événements courants et renvoient `undefined` pour tout le reste.

Référence API : [labelAdded](../../reference/labeladded/), [commandIssued](../../reference/commandissued/) et [TriggerEvent](../../reference/triggerevent/).

Consultez le contrat de l’événement pour traiter un autre type de livraison.

Référence API : [TriggerEvent](../../reference/triggerevent/).

## Autoriser les émetteurs

Une signature vérifiée prouve que la requête vient de votre intégration GitHub, GitLab ou Slack, pas que son auteur a le droit de lancer un workflow. Toute personne qui peut commenter un dépôt public peut écrire `/outpost` : comparez `event.actor` à une liste explicite.

```ts
import { commandIssued } from "@elie-laloum/outpost";
import type { TriggerEvent, TriggerJob } from "@elie-laloum/outpost";

const maintainers = new Set(["github:octocat", "slack:U012AB3CD"]);

function fromCommand(event: TriggerEvent): TriggerJob | undefined {
  const command = commandIssued(event, "/outpost");
  if (!command) return undefined;
  if (!event.actor || !maintainers.has(event.actor)) return undefined;
  return {
    handler: "fix",
    runId: `${command.repository ?? "slack"}#${command.number ?? event.delivery}`,
    input: { request: command.text },
  };
}
```

Passez `fromCommand` comme `on` d’une route. `event.actor` n’est pas un acteur d’étape d’approbation Outpost : les [approbations](../approvals/) authentifient leurs décideurs séparément.

<span id="lire-la-réponse-http"></span>
<span id="éviter-les-jobs-en-double"></span>
<span id="identifier-lexécution-à-partir-de-lévénement"></span>
<span id="renouveler-un-secret"></span>
<span id="exploiter-le-serveur"></span>
<span id="limites"></span>

Pour cette étape, suivez [Exploiter un serveur de webhooks](../operating-webhooks/).
