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

The unreleased `outpost recovery inspect` command inventories the selected checkout's `.outpost/recovery`, `.outpost/logs`, `.outpost/locks` and `.outpost/workspaces`. It is available on main. It reads filesystem metadata, without reading transcript, patch or lock contents, modifying Git metadata, creating runtime directories or removing files.

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

## Recover deliberately

1. Record the error, paths and branch names; keep the recovery directory intact.
2. Inspect the retained worktree with Git status and history.
3. Examine bundles/patches in a separate recovery clone before applying them to valuable work.
4. Resolve local/remote overlap or merge conflicts, then resume with an explicit branch and conversation where appropriate.

Never remove a live lock just to bypass ownership checks.
