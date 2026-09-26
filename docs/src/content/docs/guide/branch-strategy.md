---
title: "Branch strategy"
description: "Decide where changes land and when to integrate them."
---

Set `branch` explicitly when your application needs a predictable delivery policy.

| Mode        | Effect                                                  |
| ----------- | ------------------------------------------------------- |
| `current`   | Work directly in the selected checkout.                 |
| `named`     | Use a managed work branch identified by `name`.         |
| `integrate` | Prepare a managed branch for integration into its base. |

`from` selects the starting revision for `named` and `integrate`. A named branch is useful for review without immediate integration.

## Gate integration on a command

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

## Retained work

A failed integration or dirty workspace can leave a `retainedDirectory`. Inspect it before cleanup. Uncommitted or detached work is not disposable just because the sandbox finished. [Failure recovery](../failure-recovery/) describes how to recover it.

Integration does not push to a remote repository. Keep publication in your own delivery process.

API: [BranchPolicy](../../reference/branchpolicy/) · [Workspace](../../reference/workspace/).
