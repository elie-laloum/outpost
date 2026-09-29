// Record and replay — a real dispatch is recorded once, then replayed without calling the model:
// same events, same text, same usage, and the same commits rebuilt in the sandbox.
// Handy to reproduce a bug, or to turn a real run into a deterministic test.

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  createLocalTransport,
  createReplayAgent,
  dispatch,
  readJournal,
  ReplayDivergence,
  type AgentEvent,
  type Commit,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

const repository = demoRepository(import.meta.dirname);
const state = join(import.meta.dirname, "state");
await rm(state, { recursive: true, force: true });
await mkdir(state, { recursive: true });

const brief = (name: string) => ({ file: join(import.meta.dirname, name) });

// Every run starts its branches from main: same baseline, so same commit IDs.
const run = Date.now().toString(36);
const branch = (name: string) => ({
  mode: "named" as const,
  name: `demo/${name}-${run}`,
  from: "main",
});

const log = (commits: readonly Commit[]) =>
  commits.map((commit) => `${commit.oid.slice(0, 7)} ${commit.subject}`);

const observe = (event: AgentEvent) => {
  if (event.kind === "tool") console.log("    outil :", event.name);
};

// 1. The real run, recorded. `replayable` also stores each commit as a verified patch:
//    the journal then contains repository content — keep it like the code itself.
console.log("1. exécution réelle, enregistrée");
const transporter = createLocalTransport({ directory: state });

const coder = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools: [
      createHarnessFileTools(),
      createHarnessEditTools(),
      createHarnessShellTools(),
    ],
  }),
});

const recorded = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: brief("fix.md"),
  branch: branch("recorded"),
  logging: { transporter, replayable: true },
  observe,
});

console.log("  commits :", log(recorded.commits));
console.log("  usage :", recorded.usage);

// The journal is plain JSON: it can be saved next to a test, as a fixture.
const journal = await readJournal({
  transporter,
  reference: recorded.logReference!,
});
await writeFile(join(state, "journal.json"), JSON.stringify(journal));

// 2. The replay: no model provider, no tokens, and it takes a few seconds.
console.log("\n2. rejeu, sans appeler le modèle");
const fixture = JSON.parse(await readFile(join(state, "journal.json"), "utf8"));
const replaying = createReplayAgent({ journal: fixture });

const started = Date.now();
const replayed = await dispatch({
  repository,
  sandboxProvider,
  agent: replaying,
  brief: brief("fix.md"),
  branch: branch("replayed"),
  observe, // the recorded events are emitted again
});

console.log("  commits :", log(replayed.commits));
console.log(
  "  usage rapporté :",
  replayed.usage,
  "(celui de l'enregistrement)",
);
console.log(
  `  ${Date.now() - started} ms · tours restants : ${replaying.remainingTurns}`,
);

// 3. A replay agent is single-use, and checks that nothing changed: here, the brief.
console.log("\n3. le brief a changé depuis l'enregistrement");
try {
  await dispatch({
    repository,
    sandboxProvider,
    agent: createReplayAgent({ journal: fixture }),
    brief: brief("fix-v2.md"),
    branch: branch("diverged"),
  });
} catch (error) {
  if (!(error instanceof ReplayDivergence)) throw error;
  console.log(
    `  ReplayDivergence « ${error.kind} » au tour ${error.turn} (code ${error.code})`,
  );
}

// 4. With divergence: "warn", the difference is reported and the replay goes on.
console.log("\n4. même écart, en simple avertissement");
const tolerated = await dispatch({
  repository,
  sandboxProvider,
  agent: createReplayAgent({ journal: fixture, divergence: "warn" }),
  brief: brief("fix-v2.md"),
  branch: branch("tolerated"),
  warn: (message) => console.log("  ⚠", message.split("\n")[0]),
});

console.log("  commits :", log(tolerated.commits));
