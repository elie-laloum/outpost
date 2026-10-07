import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import {
  createAgent,
  createHarness,
  createLocalTransport,
  createObservationHub,
  createRunObserver,
  defineIsolatedTask,
  defineTask,
  defineWorkflow,
  readRun,
  watchRun,
} from "@elie-laloum/outpost";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
import { demoRepository } from "../shared/repository.ts";
const repository = demoRepository(import.meta.dirname);
const transporter = createLocalTransport({
  directory: join(repository, ".outpost", "storage"),
});
const id = `demo_${randomUUID()}`;
await using receiver = await createRunObserver({
  transporter,
  id,
  kind: "workflow",
});
const observation = createObservationHub({ sinks: [receiver] });
const agent = createAgent({
  model: "offline",
  harness: createHarness({
    modelProvider: {
      name: "offline",
      async request() {
        await setTimeout(100);
        return {
          text: "<outpost>done</outpost>",
          usage: { input: 100, cached: 0, output: 20 },
        };
      },
    },
  }),
});
const summary = defineIsolatedTask({
  key: "summary",
  request: () => ({
    repository,
    agent,
    sandboxProvider: createLocalSandboxProvider(),
    branch: { mode: "named", name: `outpost/${id}` },
    brief: { text: "Summarize the demo." },
    logging: false,
  }),
});
const verify = defineTask({
  key: "verify",
  after: [summary],
  perform: (context) => context.value(summary).completed,
});
const execution = defineWorkflow("demo", [summary, verify]).start({
  observation,
});
const starting = await readRun({ transporter, id });
assert.ok(starting);
console.log("ID:", id, "Status:", starting.status);
const following = (async () => {
  for await (const event of watchRun({
    transporter,
    id,
    from: starting.seq,
    pollMs: 20,
  }))
    console.log("Event:", event.seq, event.source, event.event);
})();
await execution;
await observation.close();
await following;
const run = await readRun({ transporter, id });
assert.ok(run);
assert.equal(run.status, "done");
assert.equal(run.complete, true);
assert.equal(run.usage.input, 100);
console.log(
  "Tasks:",
  run.tasks.map((task) => `${task.key}: ${task.status}`),
);
console.log(
  "Agent:",
  run.dispatches[0]?.agent,
  "Commits:",
  run.commits,
  "Usage:",
  run.usage,
);
console.log("Storage:", join(repository, ".outpost", "storage"));
