---
title: "Webhooks"
description: "Recevoir des événements GitHub, GitLab, Slack et Standard Webhooks vérifiés, et transformer ceux qui vous intéressent en jobs de file."
---

## Recevoir un webhook et publier un job

`serveTriggers()` démarre un serveur HTTP avec une route par émetteur. Chaque route vérifie la requête avec une **source**, puis son `on(event)` renvoie un job à publier, ou `undefined` pour ignorer l’événement.

```ts title="server.mts"
import {
  createGithubWebhook,
  createSqliteTaskQueue,
  labelAdded,
  serveTriggers,
} from "@elie-laloum/outpost";

const secret = process.env.GITHUB_WEBHOOK_SECRET;
if (!secret) throw new Error("Set GITHUB_WEBHOOK_SECRET");

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
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

Ajouter le label `outpost:fix` à une issue ou à une pull request publie un job `fix` dans la file. Un worker l’exécute avec `defineWorkflowJob()` : voir [Files de jobs et workers](../job-queues/).

<!-- flow -->

1. **Serveur**: Répond à l’émetteur en quelques secondes.
   - **Vérifier**: La source contrôle la signature, sinon la réponse est `401`.
     - `createGithubWebhook()`
   - **Router**: `on(event)` renvoie un job, ou `undefined` pour ignorer l’événement.
     - `labelAdded()`
     - `commandIssued()`
   - **Publier**: Le job entre dans la file sous l’identifiant `trigger:<path>:<delivery>`.
     - `serveTriggers()`
2. **Worker**: Exécute le job dans son propre processus.
   - **Exécuter**: Un workflow avec checkpoint, sous le `runId` du job.
     - `defineWorkflowJob()`

Un job nomme un `handler` enregistré par le worker, un `runId` de 256 caractères au plus et un `input` JSON facultatif. Gardez `on()` rapide : GitHub attend une réponse pendant 10 secondes, Slack pendant 3 secondes.

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

Deux helpers reconnaissent les événements courants et renvoient `undefined` pour tout le reste.

| Helper                             | Reconnaît                                                                                                         | Renvoie                                                    |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `labelAdded(event, "outpost:fix")` | Le label, tout juste ajouté à une issue ou une pull request GitHub, ou à une issue ou une merge request GitLab.   | `repository`, `number`, `target`, `label`                  |
| `commandIssued(event, "/outpost")` | Une ligne qui commence par la commande dans un nouveau commentaire GitHub ou GitLab, ou une commande slash Slack. | `text` après la commande, `repository`, `number`, `target` |

`target` vaut `"issue"` ou `"pull-request"` ; pour une merge request GitLab, `number` est son IID. Une commande Slack ne porte que `text`.

Pour les autres événements, lisez les champs de `TriggerEvent` :

| Champ        | Contient                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `source`     | `github`, `gitlab`, `slack`, ou l’option `source` de Standard Webhooks (`standard` par défaut).                                    |
| `delivery`   | L’identifiant de livraison de l’émetteur.                                                                                          |
| `kind`       | L’événement GitHub, l’`object_kind` GitLab, `command` ou le type d’interaction Slack, ou le `type` de la charge Standard Webhooks. |
| `action`     | La sous-action, comme `labeled`, ou le nom de la commande Slack.                                                                   |
| `actor`      | L’identité de l’émetteur, comme dans le tableau des sources.                                                                       |
| `payload`    | Le corps analysé, en JSON, à vérifier avant usage.                                                                                 |
| `receivedAt` | L’heure ISO de la vérification.                                                                                                    |

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

Passez `fromCommand` comme `on` d’une route. `event.actor` n’est pas un acteur de gate Outpost : les [approbations](../approvals/) authentifient leurs décideurs séparément.

## Lire la réponse HTTP

| Statut | Signification                                                                       |
| ------ | ----------------------------------------------------------------------------------- |
| `202`  | Job publié, ou déjà publié pour cette livraison. Le corps vaut `{"job": "<id>"}`.   |
| `204`  | Événement vérifié ignoré : `on()` a renvoyé `undefined`.                            |
| `400`  | Le corps de la requête n’a pas pu être lu.                                          |
| `401`  | Vérification échouée : signature, secret, fenêtre d’horodatage ou en-tête manquant. |
| `404`  | Aucune route pour ce chemin.                                                        |
| `405`  | Méthode autre que `POST`.                                                           |
| `413`  | Corps au-delà de `maxBytes` : 1 Mio par défaut, 25 Mio au plus.                     |
| `500`  | `on()` a levé une erreur ou renvoyé un job invalide.                                |
| `503`  | La file a refusé le job. L’émetteur peut renvoyer la même livraison.                |

Les routes Slack répondent `200` avec un corps vide au lieu de `202` et `204`. `onError` reçoit le `path`, l’étape `stage` (`verify`, `route` ou `enqueue`) et la `delivery` de l’échec, jamais un secret.

## Dédupliquer les relivraisons

L’identifiant du job contient l’identifiant de livraison. Une nouvelle tentative de l’émetteur ou une relivraison manuelle le réutilise : la file garde un seul job tant qu’elle le conserve.

Une nouvelle livraison publie un nouveau job, même pour le même événement, comme un label ajouté à nouveau. C’est le `runId` qui décide si le travail est refait. Les handlers qui publient un résultat ont toujours besoin de leurs propres [clés d’idempotence](../job-queues/).

## Dériver l’exécution de la charge

Construisez le `runId` à partir de ce qui identifie le travail dans la charge : `owner/name#12`, ou un commit de tête. Les jobs de même `runId` partagent un [checkpoint](../durable-runs/) : `defineWorkflowJob()` restaure les tâches déjà terminées au lieu de les relancer.

Les signatures GitHub ne portent pas d’horodatage : une requête interceptée peut être rejouée sous un nouvel identifiant de livraison. Un `runId` dérivé de la charge fait converger ce rejeu vers la même exécution. La recette [Relire une pull request à la demande](../review-on-label/) associe chaque exécution au commit de tête.

## Faire tourner un secret

Chaque option de secret accepte aussi une fonction qui renvoie les secrets acceptés à cet instant. La source l’appelle à chaque requête.

```ts
import { createGithubWebhook } from "@elie-laloum/outpost";

const source = createGithubWebhook({
  secret: () =>
    [
      process.env.GITHUB_WEBHOOK_SECRET,
      process.env.GITHUB_WEBHOOK_SECRET_PREVIOUS,
    ].filter((value) => value !== undefined),
});
```

Acceptez les deux secrets, changez le secret chez l’émetteur, puis retirez l’ancien. Une fonction qui lève une erreur ou ne renvoie aucun secret refuse toutes les requêtes avec `401`.

## Exploiter le serveur

`serveTriggers()` écoute par défaut sur `127.0.0.1` ; `host` et `port` le modifient. Placez devant lui un reverse proxy qui termine TLS, et n’exposez que les chemins des routes.

```ts
import type { DurableTaskQueue, TriggerServer } from "@elie-laloum/outpost";

declare const server: TriggerServer;
declare const queue: DurableTaskQueue;

process.once("SIGTERM", async () => {
  await server.close();
  queue.close();
});
```

Fermez d’abord le serveur, pour qu’aucune requête n’atteigne une file fermée.

## Limites

- Outpost n’appelle pas les API GitHub, GitLab ou Slack : votre workflow publie les commentaires ou messages sur le résultat.
- L’Events API de Slack et son défi de vérification d’URL ne sont pas pris en charge.
- Aucune commande CLI `outpost` ne lance le serveur : démarrez-le depuis votre propre script.

API : [serveTriggers](../../reference/servetriggers/) · [createGithubWebhook](../../reference/creategithubwebhook/) · [createGitlabWebhook](../../reference/creategitlabwebhook/) · [createSlackSource](../../reference/createslacksource/) · [createStandardWebhook](../../reference/createstandardwebhook/) · [labelAdded](../../reference/labeladded/) · [commandIssued](../../reference/commandissued/) · [TriggerEvent](../../reference/triggerevent/) · [TriggerJob](../../reference/triggerjob/) · [defineWorkflowJob](../../reference/defineworkflowjob/).
