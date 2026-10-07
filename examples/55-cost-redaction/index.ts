// Offline demonstration with a simulated model; no account or paid call is needed.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createLocalTransport,
  createObservationHub,
  createReporter,
  defineIsolatedTask,
  defineWorkflow,
  readJournal,
} from "@elie-laloum/outpost";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
import { illustrativePrices, pricesFromCatalog } from "./prices.ts";

const repository = await mkdtemp(join(tmpdir(), "outpost-cost-demo-"));
const git = (...args: string[]) =>
  execFileSync("git", args, { cwd: repository, encoding: "utf8" });
git("init", "-b", "main");
git("config", "user.name", "Outpost demo");
git("config", "user.email", "demo@example.invalid");
git(
  "-c",
  "core.hooksPath=/dev/null",
  "commit",
  "--allow-empty",
  "-m",
  "Initial",
);

const dummySecret = "sk-" + "A".repeat(24);
const agent = createAgent({
  model: "demo",
  harness: createHarness({
    modelProvider: {
      name: "offline-demo",
      async request(request) {
        assert.ok(JSON.stringify(request).includes(dummySecret));
        return {
          text: `The dummy secret is ${dummySecret}. <outpost>done</outpost>`,
          usage: {
            input: 1_000_000,
            cached: 200_000,
            cacheCreated: 100_000,
            output: 100_000,
          },
        };
      },
    },
  }),
});
const reporter = createReporter();
const seen: unknown[] = [];
const observation = createObservationHub({
  sinks: [
    {
      observe: (event) => {
        seen.push(event);
      },
    },
  ],
});
const task = defineIsolatedTask({
  key: "summary",
  request: () => ({
    repository,
    sandboxProvider: createLocalSandboxProvider(),
    agent,
    brief: { text: `Explain how to protect this dummy secret: ${dummySecret}` },
    observe: reporter,
  }),
});
const prices = process.env.OUTPOST_PRICE_CATALOG
  ? await pricesFromCatalog()
  : illustrativePrices;
const result = await defineWorkflow("private-cost", [task]).start({
  observation,
  budget: {
    prices,
    cost: {
      currency: "EUR",
      limit: Number(process.env.OUTPOST_COST_LIMIT ?? 20),
    },
  },
  redact: [/sk-[A-Za-z0-9]{20,}/g],
});
await observation.close();
assert.ok(!JSON.stringify(seen).includes(dummySecret));
console.log("Status:", result.status, "Cost:", result.usage.cost);
console.log("Repository retained for inspection:", repository);
if (result.status === "done") {
  const output = result.value(task);
  assert.ok(output.transcript && output.logReference);
  assert.ok(!(await readFile(output.transcript, "utf8")).includes(dummySecret));
  const journal = await readJournal({
    transporter: createLocalTransport({
      directory: join(repository, ".outpost", "storage"),
    }),
    reference: output.logReference,
  });
  assert.ok(!JSON.stringify(journal).includes(dummySecret));
  console.log("Transcript and journal contain only the masked dummy key.");
}
