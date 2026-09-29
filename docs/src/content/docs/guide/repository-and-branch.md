---
title: "Repository and branch"
description: "Select the checkout an agent works on and where its changes land."
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

Runtime worktrees and ownership locks live under the target repository’s `.outpost`. Each sandbox owns one repository. Use [parallel repositories](../multiple-repositories/) to compose work across several checkouts.

API: [openWorkspace](../../reference/openworkspace/) · [WorkspaceOptions](../../reference/workspaceoptions/).

## Branch strategy

Set `branch` explicitly when your application needs a predictable delivery policy.

| Mode        | Effect                                                  |
| ----------- | ------------------------------------------------------- |
| `current`   | Work directly in the selected checkout.                 |
| `named`     | Use a managed work branch identified by `name`.         |
| `integrate` | Prepare a managed branch for integration into its base. |

`from` selects the starting revision for `named` and `integrate`. A named branch is useful for review without immediate integration.

### Gate integration on a command

Own the workspace when integration must happen after checks. Insert agent work before the test command in this example.

```ts
import { openWorkspace } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const workspace = await openWorkspace({
  repository,
  branch: { mode: "integrate" },
});
try {
  const sandbox = await workspace.sandbox({ sandboxProvider });
  try {
    const check = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
    });
    if (check.status !== 0) throw new Error(check.stderr || "Tests failed");
  } finally {
    await sandbox.close();
  }
  await workspace.integrate();
} finally {
  await workspace.close();
}
```

Close the sandbox before integrating so its final synchronization has completed. A cold `dispatch()` with integration policy manages integration itself; use the explicit workspace form when the application needs an extra gate.

### Retained work

A failed integration or dirty workspace can leave a `retainedDirectory`. Inspect it before cleanup. Uncommitted or detached work is not disposable just because the sandbox finished. [Failure recovery](../recovery/) describes how to recover it.

Integration does not push to a remote repository. Keep publication in your own delivery process.

API: [BranchPolicy](../../reference/branchpolicy/) · [Workspace](../../reference/workspace/).
