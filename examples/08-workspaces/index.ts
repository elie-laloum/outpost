// Workspaces — Git work outlives the environments that produce it.
// A workspace owns the branch; sandboxes come and go on top of it.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  openWorkspace,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

const writer = createAgent({
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

await using workspace = await openWorkspace({
  repository: demoRepository(import.meta.dirname),
  branch: { mode: "named", name: "demo/notes" },
});

console.log("branche :", workspace.branch, "dans", workspace.directory);

// First sandbox: the agent writes and commits a note.
{
  await using sandbox = await workspace.sandbox({ sandboxProvider });
  const result = await sandbox.dispatch({
    agent: writer,
    brief: { file: join(import.meta.dirname, "1-write.md") },
  });

  console.log("commits :", result.commits);
}
// This sandbox is closed, but the workspace and its branch are still there.

// Second, brand-new sandbox: the agent finds the note on the same branch.
{
  await using sandbox = await workspace.sandbox({ sandboxProvider });
  const result = await sandbox.dispatch({
    agent: writer,
    brief: { file: join(import.meta.dirname, "2-read.md") },
  });

  console.log(result.text);
}
