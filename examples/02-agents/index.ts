// Agents — an agent = a createHarness (how to work) + a model (who thinks).
// Building one starts nothing: no sandbox, no network request.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  dispatch,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

const readerHarness = createHarness({
  modelProvider,
  instructions: "You read files before answering.",
  tools: [createHarnessFileTools()],
});

const reader = createAgent({ model, harness: readerHarness });

console.log("agent :", reader.name, reader.model);

// A setting the model cannot express is rejected right away,
// before anything is allocated.
try {
  createAgent({
    model: { ...model, maxOutputTokens: -1 },
    harness: readerHarness,
  });
} catch (error) {
  console.log("refusé :", (error as Error).message);
}

// The agent can then be used anywhere: dispatch, sandbox, workflow…
const result = await dispatch({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider,
  agent: reader,
  brief: { file: join(import.meta.dirname, "brief.md") },
});

console.log(result.text);
