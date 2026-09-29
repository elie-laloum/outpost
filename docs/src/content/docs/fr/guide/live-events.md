---
title: "Événements en direct"
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

`workflow.start({ observe })` émet les transitions de tâches, tentatives, reprises, consommations et fin d’exécution. Les erreurs d’observateurs sont collectées dans `observerErrors`, indépendamment des erreurs de tâches. Pour les métriques et traces, utilisez l’[adaptateur de télémétrie](../audit-trails/) optionnel.

API : [AgentObservation](../../reference/agentobservation/) · [createReporter](../../reference/createreporter/) · [WorkflowEvent](../../reference/workflowevent/).

## Observer toute l’exécution

Transmettez un `ObservationHub` par `observation` pour recevoir les événements de workflow, d’agent et d’opération dans un même récepteur. Les callbacks `observe` existants conservent leur forme d’événement agent ou workflow et peuvent accompagner le hub.

```ts
import {
  createObservationHub,
  defineIsolatedTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const observation = createObservationHub({
  sinks: [
    {
      observe({ seq, source, scope, event }) {
        console.log(seq, source, scope.taskKey, scope.attempt, event.kind);
      },
    },
  ],
});
const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Review the public API without modifying files." },
  }),
});
const result = await defineWorkflow("review", [review]).start({ observation });
result.unwrap();
await observation.close();
```

`seq` croît entre le hub racine et ses enfants. `at` est l’instant d’émission par Outpost. `scope` porte les champs connus `executionId`, `taskKey`, `attempt`, `dispatchId`, `pass` et `candidate` spéculatif. `defineAgentTask` et `defineIsolatedTask` propagent automatiquement le contexte de tâche ; les tâches personnalisées transmettent explicitement `context.observation` à leurs dispatchs ou spéculations imbriqués. Chaque dispatch émet son résultat après le nettoyage de ses ressources, y compris en cas d’échec.

Les événements d’opération associent un `id` unique à `started`, puis `finished` ou `failed` ; les événements terminaux portent `durationMs`. Ils couvrent préparation et verrous du workspace, allocation et libération de sandbox, authentification/bootstrap, hooks, transferts, conversations natives, synchronisation et nettoyage. Les helpers de planification de récupération, restauration, archivage et rétention acceptent un hub facultatif en dernier argument, conservé hors des plans sérialisés.

`defineCommandTask` diffuse stdout/stderr. Les workflows exposent aussi gates, décisions, persistance/reprise de checkpoints et dépassements de budget. Les événements spéculatifs identifient leur candidat. Les tâches en queue rapportent envoi, suivi et complétion/échec ; les événements des workers distants restent côté worker.

## Livraison et gestion des erreurs

Les récepteurs synchrones sont appelés immédiatement ; les récepteurs asynchrones ont des files ordonnées indépendantes. La capacité par défaut est de 1 024 enveloppes en attente par récepteur. La saturation perd les nouvelles livraisons vers ce récepteur, incrémente `dropped` et enregistre une erreur. Un récepteur dépassant `deliveryTimeoutMs` (5 000 ms par défaut) est désactivé ; sa promesse sous-jacente ne peut pas être annulée de force. Le code utilisateur synchrone doit rendre la main rapidement.

`flush()` vide les livraisons présentes à l’appel et les tampons des récepteurs. `close()` arrête ce contexte et ses descendants et vide ses récepteurs ; il ne ferme pas les parents appartenant à l’appelant. Les points d’entrée dispatch et workflow vident leurs contextes avant de retourner. Les erreurs sont collectées dans `observerErrors` et dans la collection bornée `errors` du hub ; elles ne remplacent pas les échecs d’exécution. Un hub partagé conserve ses diagnostics entre utilisations. `createCustomReporter()` utilise la même livraison bornée et son `flush()` rejette en cas d’erreur de reporting.

Il s’agit d’un flux d’observation en direct, pas d’un registre d’état durable ni d’une garantie de livraison exactement une fois. Vérifiez `errors` et `dropped` avant de considérer une trace capturée comme complète.

## Couverture des événements CLI

Claude et Codex exposent identifiants et résultats d’outils, ainsi que le raisonnement lisible disponible. Claude accepte `createClaudeHarness({ partialMessages: true })`, émet `message-usage` par message indépendamment des totaux de tour faisant autorité et conserve les identifiants d’appels parents. Codex émet aussi les événements structurés `file-change`. Copilot et Kimi corrèlent les résultats d’outils par leurs identifiants natifs. Antigravity utilise la conversation et l’index d’étape ; un outil terminé sans sortie exposée a un aperçu vide, pas un résultat reconstruit.

`stderr` contient des lignes/fragments bornés. `stopped` distingue arrêt après complétion, inactivité, deadline, annulation et sortie de protocole trop volumineuse. Cette dernière est signalée par un aperçu brut borné et sa taille UTF-8 constatée avant l’échec. L’attachement TTY interactif n’a pas de flux structuré.

API : [createObservationHub](../../reference/createobservationhub/) · [Observation](../../reference/observation/) · [ObservationSink](../../reference/observationsink/).
