---
title: "Choose a repository and branch"
description: "Keep agent changes on a branch you can inspect."
---

Use a named branch for work you want to review. Prepare the [agent configuration](../setup/), then select the target repository explicitly. A branch is reused when its name already exists; choose a fresh name for an independent task.

## Point at a checkout

Pass `repository` to select the Git checkout the task will use. Your workflow scripts can live elsewhere; resolve the repository path from the script’s directory when you want it to work from any current directory.

```ts
import { resolve } from "node:path";
import { dispatch } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository: resolve(import.meta.dirname, "../application"),
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/update-deps" },
  brief: { text: "Update the outdated dependencies and commit the change." },
});
console.log(result.branch, result.commits.length);
// Example output: outpost/update-deps 1
```

It prints `outpost/update-deps` and the number of commits. A relative path resolves from the working directory: resolving it from `import.meta.dirname` lets the script run from anywhere.

## Choose where commits land

| Desired result               | Choice                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Review before merging        | `branch: { mode: "named", name: "outpost/my-change" }` retains changes separately. |
| Work in the current checkout | `branch: { mode: "current" }` changes its files directly.                          |
| Integrate after success      | `branch: { mode: "integrate" }` works separately, then integrates locally.         |

Without an explicit policy, mounted execution uses `current` and remote execution uses `integrate`.

Keep the work on a named branch to review commits before merging. Choose automatic integration when a successful task should merge its commits into your starting branch.

API reference: [BranchPolicy](../../reference/branchpolicy/).

## Reuse one workspace across sandboxes

An open workspace owns the repository, the branch and the copied files. `workspace.dispatch()` and `workspace.sandbox()` start a fresh sandbox on it each time, so two agents can work in turn on the same branch. Passing `workspace` to [`createSandbox()`](../../reference/createsandbox/) or `dispatch()` does the same.

A workspace serves one sandbox at a time. Close the sandbox before the workspace: [How it works](../how-it-works/) shows who closes what.

## Copy ignored files into the worktree

A new worktree holds only committed files. `copies` lists repository-relative files or directories to copy from your checkout, such as an ignored test configuration.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/e2e" },
  copies: [".env.test"],
  brief: { text: "Run the end-to-end tests and fix what fails." },
});
console.log(result.retainedDirectory);
// Example output: /project/.outpost/workspaces/…
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

## Next steps

- [Check before integrating changes](../integrating-changes/)
