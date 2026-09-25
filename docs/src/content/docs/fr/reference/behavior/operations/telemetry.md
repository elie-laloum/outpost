---
title: "Exporter la télémétrie des workflows"
description: "Événements structurés, métriques privées et exportateurs OpenTelemetry injectés."
sidebar:
  order: 5
---

`WorkflowOptions.observe` reçoit les événements `start`, `task`, `attempt`, `retry`, `usage` et `finish`. Chacun contient `executionId`, le nom du workflow et un `timestamp` ISO ; les tâches incluent clé et statut, les admissions le numéro de tentative à partir de 1, la consommation des incréments, et les événements terminaux le statut et, pour les opérations démarrées, `durationMs`. La durée d’une tâche comprend condition, nouvelles tentatives et délais associés. `WorkflowResult.usage` cumule aussi les tentatives échouées. Les exceptions des observateurs sont conservées dans `observerErrors` sans modifier l’exécution.

## OpenTelemetry

Installez l’API facultative avec le SDK et l’exportateur de votre choix. L’import principal d’Outpost ne charge pas OpenTelemetry. L’adaptateur `@elie-laloum/outpost/opentelemetry` reçoit un `Tracer` et un `Meter` injectés ; il ne configure ni providers globaux ni destination réseau.

```sh
npm install @opentelemetry/api @opentelemetry/sdk-trace-base @opentelemetry/sdk-metrics
```

Cet exemple autonome exporte en mémoire, sans identifiants, agent ni trafic réseau :

```ts
import { task, workflow } from "@elie-laloum/outpost";
import { openTelemetry } from "@elie-laloum/outpost/opentelemetry";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
  AggregationTemporality,
  InMemoryMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";

const spans = new InMemorySpanExporter();
const metrics = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);
const tracer = new BasicTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(spans)],
});
const meter = new MeterProvider({
  readers: [
    new PeriodicExportingMetricReader({
      exporter: metrics,
      exportIntervalMillis: 60_000,
    }),
  ],
});
const telemetry = openTelemetry({
  tracer: tracer.getTracer("my-workflows"),
  meter: meter.getMeter("my-workflows"),
});
try {
  const inspect = task({
    key: "inspect",
    perform(context) {
      context.reportUsage({ input: 10, cached: 0, output: 2 });
    },
  });
  const result = await workflow("inspection", [inspect]).start({
    observe: telemetry.observe,
    budget: { usage: { output: 100 } },
  });
  result.unwrap();
  await tracer.forceFlush();
  await meter.forceFlush();
  console.log(spans.getFinishedSpans().map((span) => span.name));
  console.log(metrics.getMetrics());
} finally {
  telemetry.close();
  await tracer.shutdown();
  await meter.shutdown();
}
```

Un adaptateur peut recevoir plusieurs exécutions concurrentes. Chaque workflow possède un span `outpost.workflow`, des enfants `outpost.task`, et des enfants de tentative `outpost.task.attempt`. Le contexte OpenTelemetry actif à l’événement `start` devient le parent du workflow. L’adaptateur établit ses propres parents explicitement ; il n’active pas les spans des tâches pour l’instrumentation arbitraire dans `perform`. Une tentative échouée ferme son span lors du retry ; fin et annulation ferment tous les spans. Une tâche normalement ignorée conserve un statut OpenTelemetry non défini ; échecs et annulations utilisent le statut d’erreur. `close()` est idempotent, ferme les spans inachevés comme annulés et refuse ensuite les événements. Il ne vide ni n’arrête votre SDK.

Utilisez `agentTask` et `isolatedTask` pour comptabiliser automatiquement le modèle ; un `dispatch()` direct hors workflow n’alimente pas cet adaptateur. Consultez les [budgets de consommation](../../../../guide/workflows/budgets/) pour les rapports personnalisés et les corrections des résumés.

## Métriques et confidentialité

| Instrument                      | Type        | Unité / attributs                                                             |
| ------------------------------- | ----------- | ----------------------------------------------------------------------------- |
| `outpost.workflow.executions`   | Compteur    | `outpost.status`                                                              |
| `outpost.task.executions`       | Compteur    | `outpost.status`, tâches ignorées ou annulées avant démarrage comprises       |
| `outpost.task.attempts`         | Compteur    | Tentatives admises                                                            |
| `outpost.task.retries`          | Compteur    | Nouvelles tentatives prévues, y compris ensuite refusées par un budget        |
| `outpost.agent.tokens`          | Compteur    | `{token}`, `outpost.token.type` : `input`, `cached`, `cacheCreated`, `output` |
| `outpost.workflow.duration`     | Histogramme | Secondes, `outpost.status`                                                    |
| `outpost.task.duration`         | Histogramme | Secondes, `outpost.status` ; tâches démarrées seulement                       |
| `outpost.task.attempt.duration` | Histogramme | Secondes, `outpost.status`                                                    |

L’adaptateur n’exporte jamais noms de workflows, clés de tâches, identifiants d’exécution, prompts, transcripts, chemins de dépôts, commandes, entrées d’outils ou messages d’exception. Les noms de spans sont fixes et les attributs limités aux catégories de statut et de tokens. Les ressources du SDK et les spans parents restent sous votre contrôle. Les observations brutes et les logs JSONL ont d’autres propriétés de confidentialité ; consultez [les événements et logs](../../../../guide/agents/observability/).

Les erreurs de l’API de télémétrie sont isolées, y compris celles du callback facultatif `onError(error)`. Un instrument défectueux peut perdre de la télémétrie sans faire échouer le workflow. Diagnostiquez la livraison via votre SDK et appelez ses opérations de vidage/arrêt avant la sortie du processus. Le [guide officiel d’instrumentation JavaScript OpenTelemetry](https://opentelemetry.io/docs/languages/js/instrumentation/) décrit la configuration du SDK et des exportateurs.

Les contributeurs peuvent exécuter `node test/fixtures/workflow-observability.ts` après `npm ci`. Ce scénario vérifie nouvelles tentatives, budget de consommation, vrais exportateurs SDK en mémoire et cycle de vie, sans appel payant ni service externe.
