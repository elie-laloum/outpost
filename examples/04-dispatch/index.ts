// Dispatch — hand a brief to an agent and get back what happened.
// dispatch() opens a workspace, starts a sandbox, puts the agent to work,
// then closes everything it opened.

import { join } from "node:path";
import {
  createAgent,
  createReporter,
  createObservation,
  dispatch,
} from "@elie-laloum/outpost/core";
import {
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
} from "@elie-laloum/outpost/harness";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

await using observation = createObservation({ sinks: [createReporter()] });

const coder = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    instructions: "You fix bugs. Run the tests, then commit your fix with git.",
    tools: [
      createHarnessFileTools(),
      createHarnessEditTools(),
      createHarnessShellTools(),
    ],
    limits: { maxSteps: 30 },
  }),
});

const result = await dispatch({
  repository: demoRepository(import.meta.dirname),
  branch: { mode: "named", name: "demo/fix-slug" }, // the work stays on this branch
  sandboxProvider,
  agent: coder,
  brief: { file: join(import.meta.dirname, "brief.md") },
  deadlineMs: 300_000,
  observation,
});

console.log("marqueur de fin trouvé :", result.completed);
console.log("branche :", result.branch);
console.log("commits :", result.commits);
console.log("usage :", result.usage);
console.log(result.text);
