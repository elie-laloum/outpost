---
title: "Exécutions sans surveillance"
description: "Lancer des workflows sans personne au clavier : depuis un job de CI, une file durable, un créneau cron ou un webhook vérifié, chaque exécution sous checkpoint pour qu’un redémarrage ne refasse pas le travail."
---

## Quatre portes d’entrée

Toutes les portes ci-dessous mènent au même endroit : un workflow lancé depuis votre code. Choisissez celle qui correspond à qui, ou à quoi, décide de l’exécuter.

<!-- features -->

- [Exécuter en CI](../ci-automation/): Un job de pipeline lance votre script avec une clé d’API et échoue sur vos vérifications.
  - clé d’API
  - code de sortie
- [Files de jobs et workers](../job-queues/): Les producteurs déposent des jobs, des workers de longue durée les réclament et les exécutent.
  - `runQueueWorker()`
  - SQLite
  - HTTP
- [Redis et BullMQ](../redis-workers/): Une seule file partagée entre producteurs et workers répartis sur plusieurs machines.
  - Redis
  - BullMQ
- [Planification cron](../cron-schedules/): Un job déterministe par créneau, dans votre fuseau, sans doublon.
  - `createCronSchedule()`
  - créneaux
- [Webhooks](../webhooks/): Un événement GitHub, GitLab ou Slack vérifié devient un job.
  - GitHub
  - GitLab
  - Slack
- [Exécutions durables](../durable-runs/): Chaque job tourne sous un checkpoint : un redémarrage reprend au lieu de repartir de zéro.
  - checkpoints
  - `runId`

## Traiter le travail à mesure qu’il arrive

Un processus worker enregistre les handlers qu’il connaît et traite un job à la fois jusqu’à ce que son signal l’arrête. Les producteurs n’envoient jamais de code, seulement un nom de handler et du JSON.

```ts title="worker.mts"
import { createSqliteTaskQueue, runQueueWorker } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "worker-1",
    signal: stop.signal,
    handlers: {
      count: (input) => ({ value: Array.isArray(input) ? input.length : 0 }),
    },
  });
} finally {
  queue.close();
}
```

Enveloppez le workflow dans `defineWorkflowJob()` pour obtenir une exécution sous checkpoint par job, identifiée par le `runId` du job. Planifications et webhooks déposent dans la même file : le worker reste le seul processus à faire tourner des agents.

## Choisir sa porte d’entrée

| Déclenché par                        | Utilisez                                 | Tourne en continu               |
| ------------------------------------ | ---------------------------------------- | ------------------------------- |
| Un commit ou une étape de pipeline   | [Exécuter en CI](../ci-automation/)      | Le temps du job seulement       |
| Votre propre code ou un service      | [Files de jobs](../job-queues/)          | Les workers que vous exploitez  |
| L’horloge                            | [Planification cron](../cron-schedules/) | Un planificateur et des workers |
| Un événement GitHub, GitLab ou Slack | [Webhooks](../webhooks/)                 | Un serveur HTTP et des workers  |

Un trigger ne lance jamais de workflow dans la requête ou le timer qui l’a déclenché. Il publie un job déterministe : une redélivraison, un redémarrage ou une deuxième réplique convergent vers une seule exécution.

## Limites

- Les entrées et les valeurs de job sont du JSON, jusqu’à 256 Kio chacune ; un seul job à la fois par `runId`.
- Une file écarte les baux périmés, mais vos effets externes ne sont exactement-une-fois que si le service appelé déduplique votre clé d’idempotence.
- Une source de webhook vérifie la signature avant d’analyser le contenu et échoue en se fermant ; un expéditeur vérifié n’est pas une approbation, et les [gates](../approvals/) gardent leur propre acteur.
- Un créneau sauté par l’heure d’été ne se déclenche pas, un créneau répété ne se déclenche qu’une fois, et seul le dernier créneau dans `maxLateMs` est rattrapé.
- Une exécution que personne ne regarde a quand même besoin d’une limite : associez-la aux [pauses sur quota](../quota-pauses/) et aux [budgets](../budgets/).

API : [runQueueWorker](../../reference/runqueueworker/) · [createSqliteTaskQueue](../../reference/createsqlitetaskqueue/) · [TaskQueue](../../reference/taskqueue/) · [defineWorkflowJob](../../reference/defineworkflowjob/) · [createCronSchedule](../../reference/createcronschedule/) · [runSchedules](../../reference/runschedules/) · [serveTriggers](../../reference/servetriggers/) · [createGithubWebhook](../../reference/creategithubwebhook/).
