---
title: "Suivre la progression"
description: "Afficher la progression pendant l’exécution d’un agent."
---

Utilisez `observe` pour les événements normalisés de l’agent et `createReporter()` pour un affichage terminal prêt à l’emploi.

```ts
import { dispatch, createReporter } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe: createReporter({ label: "API review" }),
});
console.log(result.usage);
```

## Traiter les événements

Une observation comprend `kind`, `pass` et `at`. Filtrez sur `kind` avant de lire ses champs : `text-delta` contient du texte, `tool` identifie un appel et `usage` contient les compteurs de tokens. Les événements de protocole non reconnus peuvent apparaître sous forme `raw`.

Les observateurs rapportent la progression ; une exception dans un observateur n’annule pas l’agent. Fournissez un signal d’annulation pour arrêter l’exécution. Évitez de publier les événements bruts, car arguments et sorties des outils peuvent contenir des données du dépôt.

## Instrumenter un workflow

`workflow.start({ observe })` émet les transitions de tâches, tentatives, reprises, consommations et fin d’exécution. Les erreurs d’observateurs sont collectées dans `observerErrors`, indépendamment des erreurs de tâches. Pour les métriques et traces, utilisez l’[adaptateur de télémétrie](../journals/) optionnel.

API : [AgentObservation](../../reference/agentobservation/) · [createReporter](../../reference/createreporter/) · [WorkflowEvent](../../reference/workflowevent/).

## Couverture des événements CLI

Claude et Codex exposent identifiants et résultats d’outils, ainsi que le raisonnement lisible disponible. Claude accepte `createClaudeHarness({ partialMessages: true })`, émet `message-usage` par message indépendamment des totaux de tour faisant autorité et conserve les identifiants d’appels parents. Codex émet aussi les événements structurés `file-change`. Copilot et Kimi corrèlent les résultats d’outils par leurs identifiants natifs. Antigravity utilise la conversation et l’index d’étape ; un outil terminé sans sortie exposée a un aperçu vide, pas un résultat reconstruit.

`stderr` contient des lignes/fragments bornés. `stopped` distingue arrêt après complétion, inactivité, deadline, annulation et sortie de protocole trop volumineuse. Cette dernière est signalée par un aperçu brut borné et sa taille UTF-8 constatée avant l’échec. L’attachement TTY interactif n’a pas de flux structuré.

API : [createObservationHub](../../reference/createobservationhub/) · [Observation](../../reference/observation/) · [ObservationSink](../../reference/observationsink/).
