---
title: "Ajouter un agent CLI"
description: "Connecter une CLI d’agent de code qu’Outpost ne prend pas encore en charge."
---

Un `CliHarness` expose `kind: "cli"` et `bind(model)`, qui renvoie un `AgentAdapter`. Composez-le avec `createAgent({ harness })`. Séparez construction des requêtes et décodage des événements, déclarez honnêtement les capacités de continuation et fournissez un store uniquement si la restauration fonctionne.

Seuls `name`, `request()` et `events()` sont obligatoires. Chaque membre optionnel active une capacité : `resumable`, `forkable` et `fork()` pour la continuation, `storage` pour les conversations portables, `credentials()` et `configuration()` pour le home de l’agent, `quota()` et `unavailable()` pour le [repli](../fallback-agents/) et les pauses de quota, `usage` pour le décompte des tokens et `liveInput` pour le [pilotage](../steering/) d’un tour en cours. Outpost supervise le processus, la sandbox, l’annulation et les nouvelles tentatives de la même façon pour chaque adapter.
