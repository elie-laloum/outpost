// Observation hub — one stream for the whole run: workflow, agent and operations.
// Every event carries a global number (seq), a source and its scope (task, attempt, dispatch…).
// Sinks are isolated: a slow or broken one never makes the run fail.

import { appendFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createObservationHub,
  createSandbox,
  defineCommandTask,
  defineTask,
  defineWorkflow,
  type Observation,
  type ObservationEvent,
  type ObservationSink,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

const state = join(import.meta.dirname, "state");
await rm(state, { recursive: true, force: true });
await mkdir(state, { recursive: true });

const reader = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessFileTools()] }),
});

// 1. Three sinks, three behaviors.

// Synchronous: a compact line per event in the terminal.
const terminal: ObservationSink = {
  observe({ seq, source, scope, event }) {
    if (event.kind === "text-delta") return; // too chatty for a terminal
    const where = scope.taskKey ? `${scope.taskKey}#${scope.attempt}` : "—";
    console.log(
      `${String(seq).padStart(3)}  ${source.padEnd(12)} ${where.padEnd(10)} ${describe(event)}`,
    );
  },
};

// Asynchronous: every observation appended to a JSONL file, with its own queue.
const journal: ObservationSink = {
  observe: (observation: Observation) =>
    appendFile(
      join(state, "observations.jsonl"),
      JSON.stringify(observation) + "\n",
    ),
};

// Broken: throws on every operation. Its errors are collected, the run continues.
const broken: ObservationSink = {
  observe({ event }) {
    if (event.kind === "operation")
      throw new Error(`sink en panne sur ${event.name}`);
  },
};

const observation = createObservationHub({
  sinks: [terminal, journal, broken],
  capacity: 256, // waiting envelopes per asynchronous sink
  deliveryTimeoutMs: 2_000, // a sink slower than this is disabled
  verbose: true, // also full model requests and responses: private content, opt-in
});

// 2. The sandbox reports its own operations: allocation, workspace, release…
const sandbox = await createSandbox({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider,
  observation,
});

// 3. A command: its stdout arrives in the stream as command-output.
const files = defineCommandTask({
  key: "files",
  sandbox,
  command: { executable: "git", arguments: ["ls-files"] },
});

// 4. A custom task: pass context.observation on, so the dispatch inherits the task's scope.
const summary = defineTask({
  key: "summary",
  after: [files],
  perform: async (context) => {
    const result = await sandbox.dispatch({
      agent: reader,
      brief: { file: join(import.meta.dirname, "brief.md") },
      signal: context.signal,
      observation: context.observation,
    });

    context.reportUsage(result.usage);
    return result.text;
  },
});

const result = await defineWorkflow("observed", [files, summary]).start({
  observation,
});
result.unwrap();

console.log("\n" + result.value(summary));

// 5. Release the sandbox (its cleanup is observed too), then close the hub:
//    remaining deliveries are drained before the balance sheet.
await sandbox.close();
await observation.close();

console.log(
  "\nerreurs de sinks :",
  observation.errors.length,
  "(le run a réussi quand même)",
);
console.log("livraisons perdues :", observation.dropped);
console.log("journal :", join(state, "observations.jsonl"));

function describe(event: ObservationEvent): string {
  switch (event.kind) {
    case "operation":
      return `${event.name} ${event.status}${event.durationMs === undefined ? "" : ` (${Math.round(event.durationMs)} ms)`}`;
    case "workflow":
      return `workflow ${event.event.type} ${event.event.key ?? ""} ${event.event.status ?? ""}`;
    case "command-output":
      return `${event.channel} ${event.text.trim().replaceAll("\n", " · ")}`;
    case "tool":
      return `outil ${event.name}`;
    case "model-request":
      return `requête au modèle, ${JSON.stringify(event.request).length} caractères`;
    case "model-response":
      return `réponse du modèle, ${JSON.stringify(event.response).length} caractères`;
    case "dispatch-finished":
      return `dispatch ${event.status}, ${event.usage.input} + ${event.usage.output} tokens`;
    default:
      return event.kind;
  }
}
