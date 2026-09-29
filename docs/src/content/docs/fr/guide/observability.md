---
title: "Hub d’observation et OpenTelemetry"
description: "Recevoir tous les événements d’une exécution par un hub et exporter des traces avec OpenTelemetry."
---

Rassembler les événements de workflow, d’agent et d’opération en un seul endroit et les exporter en traces et métriques.

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

## Télémétrie

Installez `@opentelemetry/api` et importez l’adaptateur via `@elie-laloum/outpost/opentelemetry`. La `telemetry` du workflow mesure le graphe ; celle du dispatch mesure préparation, exécution de l’agent, synchronisation et nettoyage. Ce sont deux frontières d’instrumentation distinctes.

```ts
import { trace, metrics } from "@opentelemetry/api";
import { createOpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";

const telemetry = createOpenTelemetryObserver({
  tracer: trace.getTracer("outpost"),
  meter: metrics.getMeter("outpost"),
});
```

Enregistrez votre SDK OpenTelemetry et ses exportateurs avant de créer ces objets, puis passez `telemetry` aux options du workflow ou du dispatch. Sans SDK enregistré, ces objets API n’exportent pas de données.

L’application possède l’arrêt des fournisseurs de traces et métriques. Les erreurs d’instrumentation sont isolées des résultats d’exécution. `createCustomReporter()` permet un reporting personnalisé.

API : [Logging](../../reference/logging/) · [readJournal](../../reference/readjournal/) · [createReplayAgent](../../reference/createreplayagent/) · [DispatchTelemetry](../../reference/dispatchtelemetry/) · [createCustomReporter](../../reference/createcustomreporter/).

## Corréler les traces par le hub

Branchez `telemetry.sink` dans `createObservationHub({ sinks: [telemetry.sink] })`, puis transmettez ce hub par `observation`. Les spans de workflow, tâche, tentative, dispatch et opération sont ainsi liés, en conservant les noms de métriques existants. Utilisez ce branchement une seule fois par instance ; le combiner avec le branchement historique `telemetry` pour le même run compterait deux fois les événements. OpenTelemetry reste une dépendance optionnelle par sous-chemin.

Les journaux de dispatch sont des récepteurs du hub. Ils contiennent les opérations contextualisées de préparation jusqu’au nettoyage et un `dispatch-finished` terminal, y compris lors d’échecs précoces. `logging.verbose` conserve événements bruts, deltas, stderr, raisonnement et sorties d’outils diffusées ; le journal normal exclut ces événements détaillés. Les requêtes/réponses modèle complètes nécessitent en plus `createObservationHub({ verbose: true })` pour être produites. Les erreurs de livraison du journal sont des erreurs d’observation et peuvent laisser un journal incomplet ; consultez `observerErrors` et les diagnostics du hub.
