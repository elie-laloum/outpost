---
title: "How remote changes reach your repository"
description: "Understand uploads, synchronization and retained work after a transfer failure."
---

Cloud sandboxes and isolated Git containers edit a separate checkout. This page explains which files travel in each direction and why synchronization may stop. For provider setup, use [cloud sandboxes](../cloud-sandboxes/) or [private Git](../private-git/).

## Repository access

The sandbox works on its own copy of the repository. Outpost keeps it in step with the managed worktree on your machine. [Firecracker](../firecracker/) and [private Git](../private-git/) containers synchronize the same way.

`repositoryMode: "isolated"` makes the private checkout explicit on both providers; omitting it keeps the same behavior. Host Git configuration files and hooks are not uploaded, and synchronization does not import sandbox configuration, hooks or unrelated refs. History from every host branch and tag is still included in the uploaded bundle. The explicit option is covered by deterministic provider fixtures; live cloud validation remains outstanding.

<!-- canvas -->

- **Send files**: Copy Git history and selected files to the sandbox.
  - Host
  - → **Work**: sandbox ready
- **Work**: Run an agent or command remotely.
  - Sandbox
  - → **Check return**: finished
- **Check return**: Download and validate changes; check for concurrent host edits.
  - Host
  - → **Apply**: safe to apply
  - → **Recover**: conflict/failure
- **Apply**: Update the local work branch and files.
  - Host
- **Recover**: Keep recovery data for inspection.
  - Host

## Choose the branch

Without `branch`, a cloud sandbox uses `integrate`: a new `outpost/job-…` branch, merged into your current branch at the end. `named` keeps the work on a branch you name. `current` is rejected, because the sandbox cannot edit your checkout in place. See [Repository and branch](../workspaces/).

## Send files Git does not have

Commit the files the sandbox needs before running a task. For ignored test configuration or other local inputs, consult the workspace and synchronization options below.

API reference: [WorkspaceOptions](../../reference/workspaceoptions/) and [SandboxOptions](../../reference/sandboxoptions/).

:::caution
`includeUncommitted` reads the managed worktree under `.outpost/workspaces`, not your checkout. Edits you have not committed in your checkout reach the sandbox only through `copies`.
:::

A copy that `.gitignore` excludes travels one way: the agent’s edits to it stay in the sandbox. Any other copy becomes uncommitted work in the worktree, so pass `includeUncommitted: true` with it.

## When synchronization stops

Outpost never overwrites work it cannot back up. It stops with an error of code `workspace` whose `details.recovery` names the directory under `.outpost/recovery` holding the downloaded changes and the backup. Inspect it with [Recover work](../recovery/).

| Cause                                                                        | Fix                                                                 |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| The managed worktree changed while the sandbox was open                      | Leave `.outpost/workspaces` alone during the run                    |
| The agent changed a file that is uncommitted in the worktree                 | Commit the file first, or pass `includeUncommitted: true`           |
| A copy is not excluded by the committed `.gitignore` (first synchronization) | Pass `includeUncommitted: true`, or ignore the file in `.gitignore` |
| The agent created a file your host ignores outside `.gitignore`              | Move the ignore rule into the committed `.gitignore`                |
| The agent rewrote a commit that was already synchronized                     | Ask for new commits instead of an amend or a rebase                 |

`recoveryTransport` on `dispatch()` or `createSandbox()` also archives each backup to [object storage](../object-storage/).
