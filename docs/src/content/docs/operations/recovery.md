---
title: "Errors and recovery"
description: "Errors and recovery — Outpost"
sidebar:
  order: 1
---

Inspect the original error and its recovery metadata before deleting a workspace or retrying a stateful operation.

```ts
import {
  dispatch,
  codex,
  OutpostError,
  recoveryDetails,
} from "@elie-laloum/outpost";

try {
  await dispatch({
    agent: codex(),
    brief: { text: "Implement and test the fix." },
  });
} catch (error) {
  if (error instanceof OutpostError) console.error(error.code, error.details);
  console.error(recoveryDetails(error));
  throw error;
}
```

`OutpostError` contains `code`, frozen `details`, `recovery` and optional `cause`. Codes are `configuration`, `process`, `timeout`, `aborted`, `workspace`, `conflict`, `prompt`, `response`, `session` and `provider`. Multiple failures may be an `AggregateError`. Cancellation may retain a native error identity; use `recoveryDetails` rather than assuming every error is an OutpostError.

## What is preserved

Recovery metadata can include workspace, conversation, commits, transcript and log. Availability depends on how far execution reached. Dirty managed worktrees are retained; clean owned workspaces are removed after startup failure. Named branches survive clean worktree removal.

Remote recovery folders may contain `initial.bundle`/`commits.bundle`, binary-capable patches, `previous-index.patch`, untracked files under `incoming`/`previous-files`, and `state.json`. They represent prior and incoming state, not a guarantee that an interrupted transfer captured everything.

## Inspect retained storage

The unreleased `outpost recovery inspect` command inventories the selected checkout's `.outpost/recovery`, `.outpost/logs`, `.outpost/locks` and `.outpost/workspaces`. It is available on main. By default it reads filesystem metadata, without reading transcript, patch or lock contents, modifying Git metadata, creating runtime directories or removing files.

```sh
node src/cli/main.ts recovery inspect --repository /path/to/repository
node src/cli/main.ts recovery inspect --repository /path/to/repository --json
```

Use Node.js 24+ from a source checkout. With the built CLI, use `outpost recovery inspect`. `--repository` defaults to the current directory; subdirectories resolve to their Git checkout root. A linked worktree is inspected as its own checkout. Custom log locations and native conversation stores outside these four directories are not included.

Each direct child of a storage directory has an entry with its path, kind, recursive logical byte size, file/directory/symlink counts, most recent observed modification time and completeness. Hard-linked files are counted per path; sparse files use their logical length. Sizes are not allocated disk blocks or unique physical storage. Symlink targets are excluded, and symlinked storage roots are refused.

The inventory is observational, not an atomic snapshot. Files may change during traversal. Missing storage directories are normal; inaccessible paths, unsupported file types and exhausted limits produce explicit issues and partial totals. The default budget is 100,000 entries across all four directories, in recovery/logs/locks/workspaces order, with a maximum traversal depth of 64. `--max-entries NUMBER` adjusts the entry budget. Empty category directories do not consume this budget.

```sh
node src/cli/main.ts recovery inspect --repository /path/to/repository --max-entries 1000 --json
```

A complete scan exits with `0`. A partial scan exits with `1` while still printing its report; invalid arguments or an unavailable Git checkout also exit with `1`. JSON includes `repository`, `root`, `categories`, `usage`, `issues`, `complete`, `scannedEntries`, `maxEntries` and `activity: "unverified"`. It exposes metadata only. A complete inventory does not prove that recovery files are valid or inactive. This command does not determine deletion safety, prune storage, enforce retention or apply quotas.

## Inspect workspace Git state

Add `--git` to inspect the Git state of the inventoried workspace entries:

```sh
node src/cli/main.ts recovery inspect --repository /path/to/repository --git
node src/cli/main.ts recovery inspect --repository /path/to/repository --git --json
```

Registered worktrees show their branch or detached HEAD, commit, clean/dirty status and Git worktree lock flag. Dirty includes staged, unstaged, untracked and submodule changes. Ignored files are excluded from Git status, although their sizes remain in the storage inventory. A clean worktree is not necessarily safe to delete: ignored files, unpublished commits and ongoing operations may still matter. A Git worktree lock is distinct from an Outpost operation lock and does not prove activity.

Directories absent from the selected repository's worktree registry are reported as `unregistered`; they are not inspected through the parent repository. Non-directory entries, including symlinks, are `skipped`. Registered worktrees with unreadable or inconsistent Git metadata are `unavailable`, never assumed clean. Missing registered directories are outside this inventory, which only lists observed storage entries. The command does not prune Git registrations.

This optional check lets Git read workspace contents to calculate status; file contents, changed filenames and lock reasons are not displayed. Optional Git locks, fsmonitor and automatic maintenance are disabled. Each Git command has a 10-second deadline and a 1 MiB stdout limit; errors or exceeded limits make the Git inspection partial. The inventory's `--max-entries` budget does not bound Git's own traversal. Both checks remain observations, not an atomic snapshot or an activity/integrity check.

JSON adds `git: { complete, workspaces, issues }`. Each workspace has `name`, `path`, `state` and, when registered, `head`, `branch` (`null` for detached HEAD), `dirty` and `locked`. Skipped/unavailable entries also have a `reason`. The top-level `complete` describes the storage inventory; `git.complete` describes the optional Git checks for listed entries. Exit status is `1` if either is partial; dirty, detached, locked or unregistered workspaces alone do not fail inspection.

## Inspect lock PIDs

Add `--locks` to read lock metadata and check whether the recorded PID exists on the local host:

```sh
node src/cli/main.ts recovery inspect --repository /path/to/repository --git --locks
node src/cli/main.ts recovery inspect --repository /path/to/repository --locks --json
```

Only regular files among the inventoried lock entries are read, with a 4 KiB limit per record. Positive integer PIDs up to 2,147,483,647 are probed with signal `0`, which does not terminate the process. The report displays the PID and `present`, `absent` or `unknown`. Only a process-not-found result (`ESRCH`) means `absent`; permission errors and other probe failures remain `unknown`. Malformed, oversized, unreadable or changing records are also unknown. Symlinks, directories and other non-file entries are skipped. Raw lock contents and nonces are not displayed.

This is a local PID observation, not proof of lock ownership or activity. Current lock records identify neither the host nor the process start time: shared filesystems, PID namespaces and PID reuse can make a PID observation misleading. An absent PID does not authorize deletion. Inspection never acquires, releases or removes existing locks, and `activity` remains `"unverified"`.

JSON adds `locks: { scope: "local-pid", complete, entries, issues }`. Each entry has `name`, `path`, `state`, a valid `pid` when available, and a `reason` for unknown/skipped results. `locks.complete` applies only to listed entries; an unknown result makes it false and the CLI exits with `1`. Present/absent PIDs alone do not fail inspection. The inventory and optional Git check keep their separate completeness fields; any partial check causes exit status `1`.

If your repository has no locks, try this source-checkout demonstration:

```sh
node test/fixtures/recovery-locks.ts
```

It creates a temporary Git repository, holds one real Outpost lock and adds one invalid PID record. Expect one `present` entry, one `unknown | INVALID_PID` and a reported inspection exit status of `1`. The demonstration itself exits successfully when this expected result is observed and removes only its temporary repository.

## Recover deliberately

1. Record the error, paths and branch names; keep the recovery directory intact.
2. Inspect the retained worktree with Git status and history.
3. Examine bundles/patches in a separate recovery clone before applying them to valuable work.
4. Resolve local/remote overlap or merge conflicts, then resume with an explicit branch and conversation where appropriate.

Never remove a live lock just to bypass ownership checks.
