---
title: "Observer les workflows et dispatch avec OpenTelemetry"
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

L’option `telemetry` dédiée au workflow est disponible depuis la version 5.0.0. Les workflows en version 4.2.0 utilisent `observe: telemetry.observe`.

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
    telemetry,
    observe(event) {
      console.log(event.type, event.status);
    },
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

await import("./dispatch.mts");
```

```sh
node example.mts
```

## Comprendre le résultat

Consultez les sorties et les effets décrits avant le code.

[Contrats, options et cas particuliers](../../behavior/operations/telemetry/).

Les fichiers persistants éventuels restent dans ce dossier de démonstration.

## Instrumenter un dispatch complet

Avec les mêmes dépendances, enregistrez **dispatch.mts**. Cet exemple crée un dépôt temporaire et exécute une fixture locale sans appel modèle ni credentials. `localSandboxProvider()` exécute sur l’hôte.

```ts file=dispatch.mts
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { dispatch, reporter, agent } from "@elie-laloum/outpost";
import { localSandboxProvider as local } from "@elie-laloum/outpost/providers/local";
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
const traces = new BasicTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(spans)],
});
const meters = new MeterProvider({
  readers: [
    new PeriodicExportingMetricReader({
      exporter: metrics,
      exportIntervalMillis: 60_000,
    }),
  ],
});
const telemetry = openTelemetry({
  tracer: traces.getTracer("dispatch-example"),
  meter: meters.getMeter("dispatch-example"),
});
const repository = await mkdtemp(join(tmpdir(), "outpost-telemetry-"));
try {
  execFileSync("git", ["init", "-b", "main", repository]);
  await writeFile(join(repository, "README.md"), "Telemetry fixture\n");
  execFileSync("git", ["-C", repository, "add", "."]);
  execFileSync("git", [
    "-C",
    repository,
    "-c",
    "user.name=Example",
    "-c",
    "user.email=example@example.test",
    "commit",
    "-m",
    "Initial",
  ]);
  const result = await dispatch({
    repository,
    sandboxProvider: local(),
    logging: false,
    agent: agent({
      harness: {
        kind: "cli",
        bind() {
          return {
            name: "offline-fixture",
            request() {
              return {
                executable: process.execPath,
                arguments: ["-e", 'console.log("done")'],
              };
            },
            events(line) {
              return [{ kind: "text", text: line }];
            },
          };
        },
      },
    }),
    brief: { text: "Offline telemetry demonstration" },
    until: "done",
    telemetry,
    observe: reporter(),
  });
  console.log(result.completed);
  await Promise.all([traces.forceFlush(), meters.forceFlush()]);
  console.log(spans.getFinishedSpans().map((span) => span.name));
  console.log(metrics.getMetrics());
} finally {
  telemetry.close();
  try {
    await Promise.all([traces.shutdown(), meters.shutdown()]);
  } finally {
    await rm(repository, { recursive: true, force: true });
  }
}
```

```sh
node dispatch.mts
```

Le résultat attendu est `true`, un span `outpost.dispatch` et des métriques de dispatch. Le span couvre validation, allocation, exécution, synchronisation et nettoyage. `observe` contrôle indépendamment l’affichage terminal.

Passez le même adaptateur dans `telemetry` à `workflow.start({ telemetry })` et à `dispatch({ telemetry, ...options })`. L’instrumentation du workflow n’instrumente pas automatiquement les dispatchs des tâches ; passez-le explicitement à ces appels si vous souhaitez aussi leurs spans. Les tokens du workflow utilisent `outpost.agent.tokens` ; ceux du dispatch utilisent `outpost.dispatch.tokens`. Ne les additionnez pas pour le même travail. Les spans de dispatch héritent du contexte OpenTelemetry actif ; les spans de tâche ne sont pas automatiquement activés dans les fonctions de tâche.
