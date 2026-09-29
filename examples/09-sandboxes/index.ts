// Sandboxes — an environment kept alive across several operations.
// Whatever you set up in it (files, installed tools…) stays available until it closes.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessShellTools,
  createSandbox,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

const assistant = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessShellTools()] }),
});

// `await using` closes the sandbox automatically at the end of the script.
await using sandbox = await createSandbox({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider,
});

// 1. Prepare the environment: a file outside the repository, in /tmp.
await sandbox.command({
  executable: "sh",
  arguments: ["-c", "echo 'Livraison de la v2 vendredi à 14h' > /tmp/memo.txt"],
});

// 2. The agent works in that same environment: it finds the file.
const first = await sandbox.dispatch({
  agent: assistant,
  brief: { file: join(import.meta.dirname, "1-memo.md") },
});

console.log(first.text);

// 3. Continue the conversation, still in the same "warm" sandbox.
const second = await first.resume({
  brief: { file: join(import.meta.dirname, "2-follow-up.md") },
});

console.log(second.text);
