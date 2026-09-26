---
title: "Repository context"
description: "Select the checkout your agent will work on."
---

`repository` is the path to a local Git checkout with an existing commit. It is independent of the directory containing your workflow. Omitting it uses the process working directory.

## Resolve a stable path

```ts
import { resolve } from "node:path";
import { openWorkspace } from "@elie-laloum/outpost";

const workspace = await openWorkspace({
  repository: resolve(import.meta.dirname, "../application"),
  branch: { mode: "named", name: "automation/update" },
});
try {
  console.log(workspace.directory, workspace.branch);
} finally {
  await workspace.close();
}
```

Resolving from `import.meta.dirname` makes the script independent of where it is launched. Replace `../application` with your checkout path.

## Share a workspace

Pass an open `workspace` to `createSandbox()` or `dispatch()` when several environments should use the same Git workspace. Do not also supply repository or branch choices: the workspace already owns them. Close borrowed sandboxes first, then the workspace.

## Include extra inputs

`copies` lists repository-relative inputs to copy into a managed workspace, such as an ignored configuration file. For remote snapshots, `includeUncommitted` includes uncommitted host changes. Declare sensitive inputs deliberately; remote providers upload these inputs to the selected cloud environment.

Runtime worktrees and ownership locks live under the target repository’s `.outpost`. Each sandbox owns one repository. Use [parallel repositories](../parallel-repositories/) to compose work across several checkouts.

API: [openWorkspace](../../reference/openworkspace/) · [WorkspaceOptions](../../reference/workspaceoptions/).
