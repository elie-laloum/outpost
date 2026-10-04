---
title: "Repository and branch"
description: "Choose the checkout an agent edits, the branch its commits land on, and when they merge into your branch."
---

## Point at a checkout

`repository` is any path inside a local Git checkout with at least one commit. Outpost works from its top-level directory. Without `repository`, it uses the process working directory.

```ts
import { resolve } from "node:path";
import { dispatch } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository: resolve(import.meta.dirname, "../application"),
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/update-deps" },
  brief: { text: "Update the outdated dependencies and commit the change." },
});
console.log(result.branch, result.commits.length);
```

It prints `outpost/update-deps` and the number of commits. A relative path resolves from the working directory: resolving it from `import.meta.dirname` lets the script run from anywhere.

## Choose where commits land

`branch` sets the policy. Without it, local providers use `current` and [cloud sandboxes](../cloud-sandboxes/) use `integrate`.

| Mode        | The agent works on             | Worktree                                      | After a successful task               | Use it for                   |
| ----------- | ------------------------------ | --------------------------------------------- | ------------------------------------- | ---------------------------- |
| `current`   | Your checked-out branch        | None: your checkout, as it is                 | Commits are already on your branch    | Quick local tasks you watch  |
| `named`     | The branch `name`              | `.outpost/workspaces/`, then removed if clean | The branch stays for review           | Review before merging        |
| `integrate` | A temporary `outpost/…` branch | `.outpost/workspaces/`, then removed if clean | Merged into your branch, then deleted | Changes that land unattended |

`from` sets the revision a new `named` or `integrate` branch starts from; the default is `HEAD`. An existing `named` branch continues from its own tip. `result.branch` holds the branch name.

## Gate integration on a check

`dispatch()` and `workspace.dispatch()` merge an `integrate` branch as soon as the agent succeeds. To run your own check first, open the workspace yourself and work in a [sandbox session](../sandbox-sessions/).

```ts
import { openWorkspace } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const workspace = await openWorkspace({
  repository,
  branch: { mode: "integrate" },
});
try {
  const sandbox = await workspace.sandbox({ sandboxProvider, agent: coder });
  try {
    await sandbox.dispatch({
      brief: { text: "Fix the failing tests and commit the fix." },
    });
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

`sandbox.dispatch()` never merges, so the merge happens only when `npm test` passes. Otherwise the unmerged branch stays in your repository under `workspace.branch`. `integrate()` does nothing in the other modes.

## Reuse one workspace across sandboxes

An open workspace owns the repository, the branch and the copied files. `workspace.dispatch()` and `workspace.sandbox()` start a fresh sandbox on it each time, so two agents can work in turn on the same branch. Passing `workspace` to [`createSandbox()`](../../reference/createsandbox/) or `dispatch()` does the same.

A workspace serves one sandbox at a time. Close the sandbox before the workspace: [How it works](../how-it-works/) shows who closes what.

## Copy ignored files into the worktree

A new worktree holds only committed files. `copies` lists repository-relative files or directories to copy from your checkout, such as an ignored test configuration.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/e2e" },
  copies: [".env.test"],
  brief: { text: "Run the end-to-end tests and fix what fails." },
});
console.log(result.retainedDirectory);
```

Missing entries are skipped. Cloud sandboxes receive the commits and `copies`; `includeUncommitted: true` also sends the worktree’s uncommitted files ([Cloud sandboxes](../cloud-sandboxes/)). Without it, a copy that no committed `.gitignore` excludes makes the first synchronization fail with code `workspace`.

## Recover retained work

Closing keeps the worktree when it holds uncommitted, untracked or ignored files, or a detached `HEAD`. Its path comes back as `retainedDirectory`. Here, the copied `.env.test` keeps it.

`close({ preserve: true })` keeps it on purpose. Inspect retained work with [Recover work](../recovery/) and prune it with [Retention and cleanup](../retention/).

## Limits

- Integration is a local `git merge` into your checkout. Outpost never pushes: publish from your own delivery process.
- `integrate` needs a checked-out branch, not a detached `HEAD`, and fails with `conflict` if you switch branches before the merge.
- A merge that stops on a conflict fails with `conflict`; resolve or abort it in your checkout. The work branch stays.
- A second task on the same checkout (`current`) or branch fails with `conflict` instead of waiting. Give parallel tasks their own branches.
- A `named` branch checked out in your own checkout fails with `conflict`.
- `copies` requires `named` or `integrate`, and cloud sandboxes reject `current`.
- A sandbox works on one repository: see [Multiple repositories](../multiple-repositories/).

API: [dispatch](../../reference/dispatch/) · [openWorkspace](../../reference/openworkspace/) · [BranchPolicy](../../reference/branchpolicy/) · [WorkspaceOptions](../../reference/workspaceoptions/) · [Workspace](../../reference/workspace/).
