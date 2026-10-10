---
title: "Automatiser les exécutions"
description: "Choisissez la CI, les files, les planifications ou les webhooks pour lancer du travail sans session interactive."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="traiter-le-travail-à-mesure-quil-arrive"></span>

## Choisir le déclencheur

Choisissez ce qui déclenche le travail : un job de CI, une demande en file, un horaire ou un événement vérifié. Déclarez le workflow en TypeScript ou en [YAML](../recipe-services/) ; le point d’entrée détermine quand le soumettre.

<!-- features -->

- [Exécuter en CI](../ci-automation/): Un job de pipeline lance votre script avec une clé d’API et échoue sur vos vérifications.
  - clé d’API
  - code de sortie
- [Files de jobs et workers](../job-queues/): Les producteurs déposent des jobs, des workers de longue durée les réclament et les exécutent.
  - SQLite
  - HTTP
- [Redis et BullMQ](../redis-workers/): Une seule file partagée entre producteurs et workers répartis sur plusieurs machines.
  - Redis
  - BullMQ
- [Planification cron](../cron-schedules/): Un job déterministe par créneau, dans votre fuseau, sans doublon.
  - créneaux
- [Webhooks](../webhooks/): Un événement GitHub, GitLab ou Slack vérifié devient un job.
  - GitHub
  - GitLab
  - Slack
- [Exécutions durables](../durable-runs/): Utilisez `defineWorkflowJob()` pour enregistrer l’avancement d’un job de workflow. Un traitement de file ordinaire n’obtient pas de checkpoint automatiquement.
  - checkpoints

## Comparer les déclencheurs

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
- Une source de webhook vérifie la signature avant d’analyser le contenu et échoue en se fermant ; un expéditeur vérifié n’est pas une approbation, et les [étapes d’approbation](../approvals/) gardent leur propre acteur.
- Un créneau sauté par l’heure d’été ne se déclenche pas, un créneau répété ne se déclenche qu’une fois, et seul le dernier créneau dans `maxLateMs` est rattrapé.
- Une exécution que personne ne regarde a quand même besoin d’une limite : associez-la aux [pauses sur quota](../quota-pauses/) et aux [budgets](../budgets/).

API : [runQueueWorker](../../reference/runqueueworker/) · [createSqliteTaskQueue](../../reference/createsqlitetaskqueue/) · [TaskQueue](../../reference/taskqueue/) · [defineWorkflowJob](../../reference/defineworkflowjob/) · [createCronSchedule](../../reference/createcronschedule/) · [runSchedules](../../reference/runschedules/) · [serveTriggers](../../reference/servetriggers/) · [createGithubWebhook](../../reference/creategithubwebhook/).
