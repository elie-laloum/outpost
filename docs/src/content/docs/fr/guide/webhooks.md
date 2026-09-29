---
title: "Webhooks"
description: "Lancer des workflows depuis des événements GitHub, GitLab, Slack et Standard Webhooks vérifiés."
---

`serveTriggers()` démarre un serveur HTTP. Chaque route vérifie les requêtes avec une source, puis `on()` associe l’événement à un job, ou l’ignore en renvoyant `undefined`.

```ts
import {
  createGithubWebhook,
  labelAdded,
  serveTriggers,
  createSqliteTaskQueue,
} from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const secret = process.env.GITHUB_WEBHOOK_SECRET;
if (!secret) throw new Error("Set GITHUB_WEBHOOK_SECRET");
const server = await serveTriggers({
  queue,
  port: 8787,
  routes: [
    {
      path: "/github",
      source: createGithubWebhook({ secret }),
      on(event) {
        const issue = labelAdded(event, "outpost:fix");
        if (!issue) return undefined;
        return {
          handler: "fix",
          runId: `${issue.repository}#${issue.number}`,
          input: { repository: issue.repository, issue: issue.number },
        };
      },
    },
  ],
  onError: (error, failure) => console.error(failure, error),
});
console.log(`Listening on ${server.url}`);
```

L’identifiant du job est `trigger:<path>:<delivery>`. Une nouvelle tentative de l’émetteur ou une relivraison manuelle garde son identifiant de livraison et ne publie donc pas de second job. Une autre livraison pour le même `runId`, par exemple le label ajouté à nouveau, relance le job : `defineWorkflowJob()` restaure les tâches déjà terminées dans le checkpoint de cette exécution.

| Réponse   | Signification                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------- |
| `202`     | Job publié, ou déjà présent pour cette livraison. Le corps vaut `{"job": "<id>"}`.                |
| `204`     | Événement vérifié ignoré par `on()`.                                                              |
| `401`     | Vérification échouée : signature, source de secrets, fenêtre d’horodatage ou en-tête obligatoire. |
| `404/405` | Chemin inconnu, ou méthode autre que `POST`.                                                      |
| `413`     | Corps plus grand que `maxBytes` (1 Mio par défaut, jusqu’à 25 Mio).                               |
| `500`     | `on()` a levé une erreur ou renvoyé un job invalide.                                              |
| `503`     | La file a refusé le job ; l’émetteur peut renvoyer la même livraison.                             |

Les routes Slack répondent `200` avec un corps vide au lieu de `202` et `204`, car Slack attend `200`. `onError` reçoit les échecs des étapes `verify`, `route` et `enqueue`, jamais les secrets. Gardez `on()` rapide : GitHub attend une réponse pendant 10 secondes et Slack pendant 3 secondes.

## Sources

| Source                                  | Vérification                                                                                  | Identifiant de livraison                       | Acteur              |
| --------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------- |
| `createGithubWebhook({ secret })`       | `X-Hub-Signature-256` (HMAC-SHA256 du corps) ; charges JSON ou formulaire.                    | `X-GitHub-Delivery`                            | `github:<login>`    |
| `createGitlabWebhook({ signingToken })` | `webhook-signature` avec un jeton de signature `whsec_` (GitLab 19.0+), fenêtre de 5 minutes. | `webhook-id`                                   | `gitlab:<username>` |
| `createGitlabWebhook({ token })`        | `X-Gitlab-Token` comparé en temps constant.                                                   | `Idempotency-Key`, sinon `X-Gitlab-Event-UUID` | `gitlab:<username>` |
| `createSlackSource({ signingSecret })`  | `X-Slack-Signature` sur `v0:timestamp:body`, fenêtre de 5 minutes.                            | `trigger_id`                                   | `slack:<user id>`   |
| `createStandardWebhook({ secret })`     | Secret `whsec_` [Standard Webhooks](https://www.standardwebhooks.com/), fenêtre de 5 minutes. | `webhook-id`                                   | aucun               |

Préférez un jeton de signature GitLab : un `X-Gitlab-Token` simple est envoyé tel quel et ne signe pas le corps. Les sources Slack acceptent les commandes slash et les charges interactives ; l’Events API et son défi de vérification d’URL ne sont pas pris en charge. Chaque secret peut être une fonction qui renvoie les valeurs actuellement acceptées ; pendant une rotation, renvoyez l’ancien et le nouveau secret. Une source vide ou en échec refuse toutes les requêtes.

`TriggerEvent` expose `source`, `delivery`, `kind` (événement GitHub, `object_kind` GitLab, `command` ou le type d’interaction Slack), `action`, `actor` et la charge `payload` analysée. `labelAdded(event, label)` reconnaît un label qui vient d’être ajouté à une issue ou une pull request GitHub, ou à une issue ou une merge request GitLab. `commandIssued(event, "/outpost")` renvoie le texte qui suit la commande dans un nouveau commentaire GitHub ou GitLab, ou dans une commande slash Slack.

## Autoriser les émetteurs

Une signature vérifiée prouve que la requête vient de l’intégration GitHub, GitLab ou Slack configurée. Elle ne prouve pas que la personne à l’origine de l’événement a le droit de lancer un workflow. Toute personne pouvant commenter un dépôt public peut écrire `/outpost` ; comparez `event.actor` à une liste explicite :

```ts
import { commandIssued } from "@elie-laloum/outpost";
import type { TriggerEvent, TriggerJob } from "@elie-laloum/outpost";

const maintainers = new Set(["github:octocat", "slack:U012AB3CD"]);

function fromCommand(event: TriggerEvent): TriggerJob | undefined {
  const command = commandIssued(event, "/outpost");
  if (!command || !event.actor || !maintainers.has(event.actor)) return;
  return {
    handler: "fix",
    runId: `${command.repository ?? "slack"}#${command.number ?? event.delivery}`,
    input: { request: command.text },
  };
}
```

L’acteur est l’identité de l’émetteur, pas un acteur de gate Outpost. Les [gates de revue](../approvals/) conservent leur propre autorisation.

## Exploiter le serveur

`serveTriggers()` écoute par défaut sur `127.0.0.1`. Exposez-le derrière un reverse proxy qui termine TLS ; les émetteurs n’ont besoin que de ce seul chemin. À l’arrêt, fermez le serveur renvoyé, puis sa file.

La déduplication dure tant que la file conserve le job. Les signatures GitHub n’ont pas d’horodatage : une requête interceptée pourrait être renvoyée sous un nouvel identifiant de livraison. Livrez via TLS et dérivez `runId` de la charge, comme ci-dessus, pour qu’un événement rejoué converge vers le même checkpoint. Les jobs de déclencheur ne rendent pas les effets externes exactement uniques ; suivez les [clés d’idempotence](../job-queues/#dédupliquer-les-effets) dans les handlers qui publient des résultats.

## Limites

Outpost n’appelle pas les API GitHub, GitLab ou Slack : publier un commentaire ou un message sur le résultat relève de votre workflow. L’approbation d’une gate depuis un commentaire ou un bouton Slack, une commande CLI pour lancer le serveur et l’Events API de Slack ne sont pas fournis. Les tests utilisent des signatures calculées localement et des émetteurs simulés, pas des intégrations réelles.

API : [createCronSchedule](../../reference/createcronschedule/) · [runSchedules](../../reference/runschedules/) · [serveTriggers](../../reference/servetriggers/) · [createGithubWebhook](../../reference/creategithubwebhook/) · [createGitlabWebhook](../../reference/creategitlabwebhook/) · [createSlackSource](../../reference/createslacksource/) · [createStandardWebhook](../../reference/createstandardwebhook/) · [defineWorkflowJob](../../reference/defineworkflowjob/).
