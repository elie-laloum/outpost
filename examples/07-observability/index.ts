// Observability — follow what the agent does without affecting the result.

import { join } from "node:path";
import {
  createAgent,
  createCustomReporter,
  createHarness,
  createHarnessFileTools,
  createLocalTransport,
  createReporter,
  dispatch,
  readJournal,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

const repository = demoRepository(import.meta.dirname);
const brief = { file: join(import.meta.dirname, "brief.md") };

const reader = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessFileTools()] }),
});

// 1. createReporter(): the ready-made terminal display.
await dispatch({
  repository,
  sandboxProvider,
  agent: reader,
  brief,
  observe: createReporter(),
});

// 2. createCustomReporter(): your own handlers, one per event type.
const report = createCustomReporter({
  step: (event) => console.log(`— étape ${event.index}`),
  tool: (event) => console.log("  outil :", event.name, event.input),
  "tool-result": (event) => console.log(`  ↳ ${event.characters} caractères`),
  usage: (event) =>
    console.log(
      `  tokens : ${event.tokens.input} entrée / ${event.tokens.output} sortie`,
    ),
});

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: reader,
  brief,
  observe: report,
});

await report.flush(); // wait for all handlers to finish

// 3. Afterwards: the cumulative usage, and the journal kept in the repository's .outpost/storage.
console.log("usage total :", result.usage);
console.log("journal :", result.logReference);

const journal = await readJournal({
  transporter: createLocalTransport({
    directory: join(repository, ".outpost", "storage"),
  }),
  reference: result.logReference!,
});
console.log(`  ${journal.length} événements enregistrés`);
