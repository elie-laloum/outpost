---
title: "Déclencheurs"
description: "Lancer des workflows selon une planification cron ou à partir d’événements GitHub, GitLab, Slack et Standard Webhooks vérifiés."
---

Implémenté, pas encore publié. Un déclencheur n’exécute jamais un workflow dans la requête ou le minuteur qui le déclenche. Il publie un job dans une [file](../background-jobs/), et un worker exécute le workflow avec un checkpoint. Chaque job porte un `runId` et une entrée JSON `input` ; `defineWorkflowJob()` les transforme en exécution avec checkpoint.

```ts
import {
  createLocalTransport,
  runQueueWorker,
  createSqliteTaskQueue,
  defineTask,
  defineWorkflow,
  createWorkflowCheckpointStore,
  defineWorkflowJob,
} from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "worker-1",
    signal: stop.signal,
    handlers: {
      fix: defineWorkflowJob({
        checkpoint: { store, version: "1" },
        workflow: (input, { runId }) =>
          defineWorkflow(runId, [
            defineTask({ key: "report", perform: () => ({ received: input }) }),
          ]),
      }),
    },
  });
} finally {
  queue.close();
}
```

Remplacez la tâche par votre propre graphe, par exemple un `defineAgentTask` qui corrige l’issue indiquée dans `input`. Les producteurs ci-dessous publient dans la même file : un planificateur, un serveur de webhooks, ou les deux.

## Planifier des exécutions

`createCronSchedule()` analyse une expression cron à cinq champs évaluée dans un fuseau horaire IANA (UTC par défaut). `runSchedules()` publie un job par créneau jusqu’à l’interruption de son signal.

```ts
import {
  createCronSchedule,
  runSchedules,
  createSqliteTaskQueue,
} from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runSchedules({
    queue,
    signal: stop.signal,
    schedules: [
      {
        name: "nightly-audit",
        cron: createCronSchedule("0 2 * * 1-5", { timeZone: "Europe/Paris" }),
        handler: "audit",
        runId: (slot) => `audit-${slot.toISOString().slice(0, 10)}`,
        input: (slot) => ({ day: slot.toISOString().slice(0, 10) }),
      },
    ],
  });
} finally {
  queue.close();
}
```

- **Syntaxe.** Minute, heure, jour du mois, mois et jour de la semaine, avec listes (`1,15`), intervalles (`1-5`), pas (`*/10`, `8-18/2`), noms de mois et de jours (`JAN`, `MON-FRI`), `7` pour dimanche et les macros `@hourly`, `@daily`, `@weekly`, `@monthly` et `@yearly`. Comme dans Vixie cron, lorsque les deux champs de jour sont restreints, un jour qui correspond à l’un des deux suffit. Il n’y a pas de champ des secondes.
- **Heure d’été.** Les créneaux sont des heures murales. Une heure sautée au passage à l’heure d’été ne se déclenche pas ; une heure répétée en automne se déclenche une seule fois, à sa première occurrence.
- **Identité des jobs.** Chaque créneau publie le job `schedule:<name>:<heure ISO du créneau>`. Deux planificateurs qui partagent une file, ou un planificateur redémarré, publient le même job, et la file n’en garde qu’un exemplaire. `runId` vaut par défaut `<name>:<heure ISO du créneau>` et `input` vaut `null`.
- **Créneaux en retard.** Un créneau n’est publié que si au plus `maxLateMs` (60 secondes par défaut) s’est écoulé. Après un redémarrage ou un processus suspendu, seul le dernier créneau manqué dans cette fenêtre est publié ; les créneaux plus anciens sont ignorés plutôt que rejoués en rafale.
- **Échecs.** Sans `onError`, le premier échec de publication rejette `runSchedules()`. Avec lui, l’échec est signalé avec la planification et le créneau, et la planification continue.

`createCronSchedule()` refuse une expression sans aucune occurrence, comme `0 0 30 2 *`. Ses méthodes `next()` et `previous()` calculent des créneaux sans rien publier :

```ts
import { createCronSchedule } from "@elie-laloum/outpost";

const nightly = createCronSchedule("30 2 * * *", { timeZone: "Europe/Paris" });
console.log(nightly.next(new Date("2026-03-28T12:00:00Z")).toISOString());
```

<!-- check:run -->

Ce code affiche `2026-03-30T00:30:00.000Z` : 02:30 n’existe pas à Paris le 29 mars 2026.

Une planification CI, comme un workflow GitHub Actions `schedule` qui lance un script, est une alternative lorsqu’aucun processus de longue durée n’est disponible.

## Recevoir des webhooks

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

L’acteur est l’identité de l’émetteur, pas un acteur de gate Outpost. Les [gates de revue](../review-gates/) conservent leur propre autorisation.

## Exécuter le workflow

`defineWorkflowJob({ workflow, checkpoint, start })` renvoie un handler de file. Pour chaque job, il construit le workflow à partir de `input`, puis le démarre avec le `runId` du job comme exécution de checkpoint et avec le signal d’annulation du job. La même entrée doit construire le même workflow.

- **Version du checkpoint.** La version de l’exécution est `checkpoint.version` suivie d’une empreinte de l’entrée. Le même `runId` avec une autre entrée est refusé par la vérification d’identité du checkpoint au lieu de mélanger deux demandes dans une exécution.
- **Résultat.** La valeur du job indique `runId`, la `version` effective du checkpoint, `executionId`, `status`, le statut de chaque tâche, les gates en attente (`pauses`) et `inputRequests`. L’usage correspond à l’usage cumulé des tokens du workflow.
- **Échecs.** Un workflow `failed` ou `cancelled` termine le job avec une erreur. Une exécution en pause ou en attente termine le job normalement avec ce statut.
- **Concurrence.** Un checkpoint n’a qu’un propriétaire à la fois : un second job pour une exécution encore en cours échoue, et sa livraison peut être renvoyée plus tard.
- **Gates.** Pour approuver une exécution en pause, soumettez la [décision](../review-gates/#soumettre-une-décision) au même workflow avec `checkpoint: { store, runId, version }` issus de la valeur du job.

`start` transmet les autres options du workflow, comme `concurrency`, `budget`, `onQuota` ou `timeoutMs`. Rejouer des tâches incomplètes exige toujours `checkpoint.resume: "retry-incomplete"`, comme pour toute [exécution durable](../durable-runs/).

## Exploiter le serveur

`serveTriggers()` écoute par défaut sur `127.0.0.1`. Exposez-le derrière un reverse proxy qui termine TLS ; les émetteurs n’ont besoin que de ce seul chemin. À l’arrêt, fermez le serveur renvoyé, puis sa file.

La déduplication dure tant que la file conserve le job. Les signatures GitHub n’ont pas d’horodatage : une requête interceptée pourrait être renvoyée sous un nouvel identifiant de livraison. Livrez via TLS et dérivez `runId` de la charge, comme ci-dessus, pour qu’un événement rejoué converge vers le même checkpoint. Les jobs de déclencheur ne rendent pas les effets externes exactement uniques ; suivez les [clés d’idempotence](../background-jobs/#dédupliquer-les-effets) dans les handlers qui publient des résultats.

## Limites

Outpost n’appelle pas les API GitHub, GitLab ou Slack : publier un commentaire ou un message sur le résultat relève de votre workflow. L’approbation d’une gate depuis un commentaire ou un bouton Slack, une commande CLI pour lancer le serveur et l’Events API de Slack ne sont pas fournis. Les tests utilisent des signatures calculées localement et des émetteurs simulés, pas des intégrations réelles.

API : [createCronSchedule](../../reference/createcronschedule/) · [runSchedules](../../reference/runschedules/) · [serveTriggers](../../reference/servetriggers/) · [createGithubWebhook](../../reference/creategithubwebhook/) · [createGitlabWebhook](../../reference/creategitlabwebhook/) · [createSlackSource](../../reference/createslacksource/) · [createStandardWebhook](../../reference/createstandardwebhook/) · [defineWorkflowJob](../../reference/defineworkflowjob/).
