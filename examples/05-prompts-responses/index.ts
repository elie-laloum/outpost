// Prompts and responses — the brief describes the work, the response contract
// describes the data the program accepts in return.

import { join } from "node:path";
import * as v from "valibot";
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createReporter,
  defineJsonResponse,
  dispatch,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

// The contract: any Standard Schema (Valibot, Zod…) will do.
const Summary = v.object({
  name: v.string(),
  purpose: v.string(),
  files: v.array(v.string()),
  difficulty: v.picklist(["easy", "medium", "hard"]),
});

const explorer = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    instructions: "You explore repositories without modifying them.",
    tools: [createHarnessFileTools()],
  }),
});

const result = await dispatch({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider,
  agent: explorer,
  observe: createReporter(),

  // The brief is a .md file; {{ audience }} is replaced with its value.
  brief: {
    file: join(import.meta.dirname, "brief.md"),
    values: { audience: "a junior developer" },
  },

  // The response is extracted between <summary> and </summary>, then validated.
  // If it's invalid, the agent gets 2 repair attempts.
  response: defineJsonResponse({ tag: "summary", schema: Summary, repairs: 2 }),
});

const summary = result.value; // typed: { name, purpose, files, difficulty }

console.log(summary.name, `(${summary.difficulty})`);
console.log(summary.purpose);
console.log(summary.files);
