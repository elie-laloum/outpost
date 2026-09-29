// Conversations — resume or fork an agent's history.
// The custom harness records every pass, so you can pick up later.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  dispatch,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

const repository = demoRepository(import.meta.dirname);
const brief = (name: string) => ({ file: join(import.meta.dirname, name) });

const coder = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    instructions: "You are a careful developer.",
    tools: [
      createHarnessFileTools(),
      createHarnessEditTools(),
      createHarnessShellTools(),
    ],
  }),
});

// 1. First discussion: the agent explains the bug without touching anything.
const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "demo/conversation" },
  brief: brief("1-explain.md"),
});

console.log("conversation :", first.conversation);
console.log(first.text);

// 2. Resume: the agent remembers its explanation and fixes the bug.
const fixed = await first.resume({
  repository,
  sandboxProvider,
  branch: { mode: "named", name: "demo/conversation" },
  brief: brief("2-fix.md"),
});

console.log("commits :", fixed.commits);

// 3. Fork: a copy of the first discussion, on another branch.
//    The original conversation stays intact.
const alternative = await first.fork({
  repository,
  sandboxProvider,
  branch: { mode: "named", name: "demo/alternative" },
  brief: brief("3-alternative.md"),
});

console.log("nouvelle conversation :", alternative.conversation);
console.log(alternative.text);
