// Harness — Outpost drives the model → tools → model… loop itself.
// You declare: tools, instructions, skills, permissions, hooks, context and limits.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  defineHarnessInstructions,
  defineHarnessSkill,
  dispatch,
  truncateToolResults,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";
import { workbench } from "./tools.ts";
import { hooks, permissions } from "./rules.ts";


// A skill: instructions the model only loads when it needs them.
const testing = defineHarnessSkill({
  name: "testing",
  description: "How to run and fix the tests of this project.",
  instructions: "Run `npm test` with the shell tool. Fix the code, never the tests.",
});


const fixer = createAgent({
  model,
  harness: createHarness({
    modelProvider,

    // Fixed text, or computed when the task starts.
    instructions: [
      "You fix bugs in small TypeScript projects.",
      defineHarnessInstructions(({ sandbox }) => `The repository is mounted at ${sandbox.root}.`),
    ],

    tools: [workbench],
    skills: [testing],
    permissions,
    hooks,

    // Trim old tool results so the context doesn't fill up.
    context: truncateToolResults({ keepRecent: 4, maxCharacters: 2_000 }),

    // Beyond this, the pass fails with code "limit".
    limits: { maxSteps: 30, maxToolCalls: 60 },
  }),
});


const result = await dispatch({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider,
  agent: fixer,
  branch: { mode: "named", name: "demo/harness" },
  brief: { file: join(import.meta.dirname, "brief.md") },

  // Watch the loop run.
  observe(event) {
    if (event.kind === "step") console.log(`— étape ${event.index}`);
    if (event.kind === "tool") console.log("  outil :", event.name, event.kind);
    if (event.kind === "tool-denied") console.log("  refusé :", event.name, event.reason);
    if (event.kind === "stop-prevented") console.log("  arrêt refusé :", event.message);
    if (event.kind === "tool-result") console.log("resultat :", event.preview);
  },
});

console.log(result.text);
console.log("commits :", result.commits);
