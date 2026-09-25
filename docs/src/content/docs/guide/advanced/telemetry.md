---
title: "Observe workflows and dispatch with OpenTelemetry"
description: "Run the complete example below, then inspect its output and compare it with the detailed contract."
---

Run the complete example below, then inspect its output and compare it with the detailed contract.

<!-- scenario:offline -->

<!-- preparation:offline -->

<details>
<summary>Prepare this example from scratch</summary>

Use Node.js **24+** and npm. Start in a new directory for each example.

```sh
mkdir outpost-example
cd outpost-example
```

```sh
npm init -y
npm install @elie-laloum/outpost
```

Save the example as **example.mts** in this directory. No account, API key or container is needed.

</details>

<!-- /preparation -->

## Prerequisites and effects

First install `npm install @opentelemetry/api @opentelemetry/sdk-trace-base @opentelemetry/sdk-metrics`. Inspect the exported spans and metrics; prompts, actor reasons and credentials must not become metric labels. The telemetry entry point is optional and does not change workflow outcomes.

## Try it

Save **example.mts** in `outpost-example/`.

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

await import("./dispatch.mts");
```

```sh
node example.mts
```

## Understand the result

Check the output and effects described before the code.

[Contracts, options and edge cases](../../behavior/operations/telemetry/).

Any persisted example files remain inside this demonstration directory.

## Instrument a complete dispatch

With the same dependencies, save **dispatch.mts**. This example creates a temporary repository and runs a local fixture without model calls or credentials. `localSandboxProvider()` executes on the host.

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

Expect `true`, one `outpost.dispatch` span and dispatch metrics. The span includes validation, allocation, execution, synchronization and cleanup. `observe` independently controls terminal output.

The same adapter can be passed to a workflow as `observe: telemetry.observe` and to its agent requests as `telemetry`. Workflow tokens use `outpost.agent.tokens`; dispatch tokens use `outpost.dispatch.tokens`. Do not sum both for the same work. Dispatch spans inherit the active OpenTelemetry context; workflow task spans are not automatically activated inside task functions.
