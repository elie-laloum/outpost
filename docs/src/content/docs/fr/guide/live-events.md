---
title: "Événements en direct"
description: "Afficher la progression pendant l’exécution d’un agent."
---

Utilisez `observe` pour les événements normalisés de l’agent et `reporter()` pour un affichage terminal prêt à l’emploi.

```ts
import { dispatch, reporter } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe: reporter({ label: "API review" }),
});
console.log(result.usage);
```

## Traiter les événements

Une observation comprend `kind`, `pass` et `at`. Filtrez sur `kind` avant de lire ses champs : `text-delta` contient du texte, `tool` identifie un appel et `usage` contient les compteurs de tokens. Les événements de protocole non reconnus peuvent apparaître sous forme `raw`.

Les observateurs rapportent la progression ; une exception dans un observateur n’annule pas l’agent. Fournissez un signal d’annulation pour arrêter l’exécution. Évitez de publier les événements bruts, car arguments et sorties des outils peuvent contenir des données du dépôt.

## Instrumenter un workflow

`workflow.start({ observe })` émet les transitions de tâches, tentatives, reprises, consommations et fin d’exécution. Les erreurs d’observateurs sont collectées dans `observerErrors`, indépendamment des erreurs de tâches. Pour les métriques et traces, utilisez l’[adaptateur de télémétrie](../audit-trails/) optionnel.

API : [AgentObservation](../../reference/agentobservation/) · [reporter](../../reference/reporter/) · [WorkflowEvent](../../reference/workflowevent/).
