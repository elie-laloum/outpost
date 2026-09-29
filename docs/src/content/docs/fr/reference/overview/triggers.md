---
title: "Déclencheurs — Vue d’ensemble"
description: "Transformez les créneaux cron et les webhooks vérifiés en jobs de file déterministes qui exécutent des workflows avec checkpoint."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Choisir une source de déclenchement

Une planification publie depuis un minuteur local. Une source de webhook vérifie chaque requête avant d’analyser son corps et répond 401 à tout échec, y compris un secret absent ou inutilisable.

| Source                                       | Vérifie                                                                           | Identifiant du job                                                 | `actor`                  |
| -------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------ |
| `runSchedules()` avec `createCronSchedule()` | Rien : les créneaux viennent de l’expression cron et du fuseau horaire            | `schedule:<name>:<heure ISO du créneau>`                           | Aucun                    |
| `createGithubWebhook()`                      | `X-Hub-Signature-256` sur le corps, sans horodatage                               | `trigger:<path>:<X-GitHub-Delivery>`                               | `github:<login>`         |
| `createGitlabWebhook()`                      | `webhook-signature` avec `signingToken`, ou `X-Gitlab-Token` avec `token`         | `trigger:<path>:<webhook-id, Idempotency-Key ou UUID d’événement>` | `gitlab:<username>`      |
| `createSlackSource()`                        | `X-Slack-Signature` sur l’horodatage et le corps, dans `toleranceMs`              | `trigger:<path>:<trigger_id>`                                      | `slack:<id utilisateur>` |
| `createStandardWebhook()`                    | `webhook-signature` Standard Webhooks sur l’identifiant, l’horodatage et le corps | `trigger:<path>:<webhook-id>`                                      | Aucun                    |

:::caution
`actor` est l’identité que rapporte l’expéditeur vérifié, pas un acteur de gate Outpost. Comparez-la à une liste d’autorisation dans `on()` avant de publier du travail.
:::

## Convergence des jobs

Les identifiants de job dérivent du créneau ou de la livraison : réplicas, redémarrages et relivraisons publient donc le même job. La déduplication dure tant que la file conserve le job.

| Situation                                                                    | Résultat                                                                               |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Plusieurs réplicas du planificateur atteignent le même créneau               | Un seul job                                                                            |
| Le planificateur démarre ou se réveille après des créneaux manqués           | Seul le dernier créneau dans `maxLateMs` (60000 par défaut) est publié                 |
| Heure locale sautée par le changement d’heure                                | Aucun créneau                                                                          |
| Heure locale répétée par le changement d’heure                               | Un créneau, à sa première occurrence                                                   |
| L’expéditeur relivre une livraison                                           | Même job, rien de nouveau n’est publié ; la réponse est répétée                        |
| `on()` associe une livraison connue à un autre job                           | La file le refuse et le serveur répond 503                                             |
| Nouvelle livraison ou nouveau créneau avec le même `runId` et la même entrée | Nouveau job ; `defineWorkflowJob()` restaure les tâches terminées depuis le checkpoint |
| Même `runId` avec une autre entrée                                           | Le checkpoint est incompatible et le job se termine avec une erreur                    |

## Points d’entrée

Guide : [Webhooks](../../../guide/webhooks/) · [Planification cron](../../../guide/cron-schedules/) · [Files de jobs et workers](../../../guide/job-queues/)

- [runSchedules](../../runschedules/)
- [createCronSchedule](../../createcronschedule/)
- [serveTriggers](../../servetriggers/)
- [createGithubWebhook](../../creategithubwebhook/)
- [createGitlabWebhook](../../creategitlabwebhook/)
- [createSlackSource](../../createslacksource/)
- [createStandardWebhook](../../createstandardwebhook/)
- [labelAdded](../../labeladded/)
- [commandIssued](../../commandissued/)
- [defineWorkflowJob](../../defineworkflowjob/)
- [TriggerEvent](../../triggerevent/)
- [TriggerJob](../../triggerjob/)
