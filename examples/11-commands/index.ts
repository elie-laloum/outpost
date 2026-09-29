// Commands — run a program in the sandbox and read its result.
// The real command says whether the tests pass, not the agent.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createSandbox,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

await using sandbox = await createSandbox({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider,
  branch: { mode: "named", name: "demo/commsassdqnds" },
});

const npmTest = { executable: "npm", arguments: ["test"], deadlineMs: 60_000 };

// 1. A command returns a status: it doesn't throw if it fails.
const before = await sandbox.command(npmTest);

console.log(
  "tests avant :",
  before.status === 0 ? "OK" : `échec (statut ${before.status})`,
);

// 2. The agent fixes the bug… with no shell tool: it can't run the tests itself.
const fixer = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools: [createHarnessFileTools(), createHarnessEditTools()],
  }),
});

await sandbox.dispatch({
  agent: fixer,
  brief: { file: join(import.meta.dirname, "brief.md") },
});

// 3. We check for ourselves, following the output live.
const after = await sandbox.command({
  ...npmTest,
  observe: (channel, text) => process.stdout.write(text),
});

console.log(
  "tests après :",
  after.status === 0 ? "OK" : `échec (statut ${after.status})`,
);

// No implicit shell: ask for one explicitly when you want its syntax.
const diff = await sandbox.command({
  executable: "sh",
  arguments: ["-c", "git diff --stat | tail -1"],
});

console.log("modifications :", diff.stdout.trim());
