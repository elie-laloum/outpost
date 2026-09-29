---
title: "Déclencheurs — Vue d’ensemble"
description: "Les déclencheurs transforment les créneaux cron et les webhooks vérifiés en jobs de file qui exécutent des workflows avec checkpoint."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Les déclencheurs lancent des workflows à partir du temps ou d’événements extérieurs, sans les exécuter dans le minuteur ou la requête HTTP qui les déclenche. Chaque déclencheur publie un job de file qui porte un `runId` et une entrée JSON ; un worker de file exécute ensuite le workflow avec un checkpoint.

## Fonctionnement et philosophie

`createCronSchedule` décrit des créneaux en heure murale dans un fuseau horaire IANA, et `runSchedules` publie un job par créneau. `serveTriggers` reçoit des webhooks : chaque route vérifie les requêtes avec une source (`createGithubWebhook`, `createGitlabWebhook`, `createSlackSource` ou `createStandardWebhook`) et associe le `TriggerEvent` normalisé à un `TriggerJob`. `labelAdded` et `commandIssued` lisent les charges GitHub, GitLab et Slack courantes. Côté worker, `defineWorkflowJob` transforme chaque job en exécution de workflow avec checkpoint.

Les identifiants de job dérivent du créneau ou de la livraison, si bien que les réplicas, les redémarrages et les relivraisons convergent vers un seul job. Plusieurs événements pour le même `runId` partagent un checkpoint, et les tâches terminées sont restaurées au lieu d’être exécutées à nouveau.

## Limites et responsabilités

Une signature vérifiée authentifie l’intégration émettrice, pas la personne à l’origine de l’événement : autorisez explicitement `TriggerEvent.actor` avant de publier du travail. La déduplication dure tant que la file conserve le job, et les effets externes restent au moins une fois. Outpost n’appelle pas les API GitHub, GitLab ou Slack, et les approbations de gates depuis ces services ne sont pas fournies.

## Points d’entrée

- [createCronSchedule](../../createcronschedule/)
- [runSchedules](../../runschedules/)
- [serveTriggers](../../servetriggers/)
- [createGithubWebhook](../../creategithubwebhook/)
- [createGitlabWebhook](../../creategitlabwebhook/)
- [createSlackSource](../../createslacksource/)
- [createStandardWebhook](../../createstandardwebhook/)
- [defineWorkflowJob](../../defineworkflowjob/)

[Passer à la pratique avec le Guide](../../../guide/triggers/).
