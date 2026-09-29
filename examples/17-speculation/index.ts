// Speculative execution — several candidates attempt the same fix,
// each on its own branch; the first one validated by a real command wins.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  speculate,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const coder = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools: [createHarnessFileTools(), createHarnessEditTools(), createHarnessShellTools()],
  }),
});


// One candidate per brief: same agent, two different approaches.
const approaches = ["minimal", "regex"];

const result = await speculate({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider,
  concurrency: 2,
  budget: { attempts: 2 },

  candidates: approaches.map((key) => ({
    key,
    agent: coder,
    request: { brief: { file: join(import.meta.dirname, `${key}.md`) } },
  })),

  // Selection proves nothing: this validation is what decides.
  async validate({ sandbox, signal }) {
    const tests = await sandbox.command({ executable: "npm", arguments: ["test"], signal });
    return tests.status === 0;
  },
});


console.log("statut :", result.status);
console.log("gagnant :", result.winner?.key, "sur la branche", result.winner?.branch);

for (const candidate of result.candidates) console.log(`  ${candidate.key} → ${candidate.status}`);
