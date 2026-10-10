---
title: "Check and integrate a branch"
description: "Run checks before merging and retain rejected work for review."
---

Use this guide after [running work on a branch](../git-workspaces/). Your repository needs a test command and its dependencies in the sandbox. Integration changes the local checkout; Outpost does not push to a remote.

## Gate integration on a check

`dispatch()` and `workspace.dispatch()` merge an `integrate` branch as soon as the agent succeeds. To run your own check first, open the workspace yourself and work in a [sandbox session](../sandbox-sessions/).

<!-- tabs -->

```ts title="change.ts"
import type { Workspace } from "@elie-laloum/outpost";
import { sandboxProvider, coder } from "./outpost.config.ts";

export async function change(workspace: Workspace) {
  await using sandbox = await workspace.sandbox({
    sandboxProvider,
    agent: coder,
  });
  await sandbox.dispatch({
    brief: { text: "Fix the failing tests and commit the fix." },
  });
  const check = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
  });
  if (check.status !== 0) throw new Error(check.stderr || "Tests failed");
}
```

```ts title="integrate.ts"
import { openWorkspace } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";
import { change } from "./change.ts";

export const workspace = await openWorkspace({
  repository,
  branch: { mode: "integrate" },
});
try {
  await change(workspace);
  await workspace.integrate();
} finally {
  await workspace.close();
}
```

`sandbox.dispatch()` never merges, so the merge happens only when `npm test` passes. Otherwise the unmerged branch stays in your repository under `workspace.branch`. `integrate()` does nothing in the other modes.

## Refuse unwanted committed changes

Set a workspace `guard` to reject protected paths or an oversized final committed diff, independently of the agent. This dispatch integrates only when both rules pass. A refusal throws `OutpostError` with code `guard`, releases the sandbox and retains the branch and worktree for review.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Fix the failing tests and commit the fix." },
  branch: { mode: "integrate" },
  guard: {
    protectedPaths: [".github/**", "migrations/**"],
    maxChangedLines: 800,
  },
});
```

The count adds inserted and deleted lines; a total of 800 passes. Detected renames without content changes count zero lines, but both paths are checked. With a line limit, binary changes are refused because Git cannot count their lines. See [DiffGuard](../../reference/diffguard/) for the pattern syntax and options.

The check runs after synchronization and again under the integration lock, before merging the inspected commit. It includes changes inherited through `branch.from`, starting at the common ancestor with the host branch. In `named` mode, it checks from the workspace’s opening commit across successive executions. `current` is refused before execution. Configure `guard` on `openWorkspace()` when supplying an existing workspace; successive agents share its policy.

Only the final committed diff is checked. A protected file changed and then restored is accepted; uncommitted files are excluded. This does not restrict filesystem access. A failed or incomplete inspection also refuses integration.

Inspect `error.details` for violations and compared commits, and `recoveryDetails(error)` for the retained branch and directory. Closing the workspace preserves rejected work even without `preserve: true`. A later failure does not undo earlier integrations.

<span id="resolve-merge-conflicts-with-an-agent"></span>

For this step, follow [Resolve an integration conflict](../resolving-conflicts/).
