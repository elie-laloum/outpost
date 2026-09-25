---
title: "Observer un workflow avec OpenTelemetry"
description: "Exécutez l’exemple complet, puis examinez sa sortie et comparez-la au contrat détaillé."
---

Exécutez l’exemple complet, puis examinez sa sortie et comparez-la au contrat détaillé.

<!-- scenario:offline -->

<!-- preparation:offline -->

<details>
<summary>Préparer cet exemple depuis zéro</summary>

Utilisez Node.js **24+** et npm. Commencez dans un nouveau dossier pour chaque exemple.

```sh
mkdir outpost-example
cd outpost-example
```

```sh
npm init -y
npm install @elie-laloum/outpost
```

Enregistrez l’exemple sous **example.mts** dans ce dossier. Aucun compte, clé API ou conteneur n’est nécessaire.

</details>

<!-- /preparation -->

## Prérequis et effets

Installez d’abord `npm install @opentelemetry/api @opentelemetry/sdk-trace-base @opentelemetry/sdk-metrics`. Examinez les spans et métriques exportés ; prompts, motifs d’acteurs et identifiants ne doivent pas devenir des labels de métriques. Le point d’entrée télémétrie reste optionnel et ne change pas les résultats du workflow.

## Essayer

Enregistrez le fichier **example.mts** dans `outpost-example/`.

```ts file=example.mts
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

```sh
node example.mts
```

## Comprendre le résultat

Consultez les sorties et les effets décrits avant le code.

[Contrats, options et cas particuliers](../../behavior/operations/telemetry/).

Les fichiers persistants éventuels restent dans ce dossier de démonstration.
