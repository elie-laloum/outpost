---
title: "Choose a repository"
description: "Keep workflow configuration separate from target Git repositories."
sidebar:
  order: 1
---

A workflow project contains the script, brief, credentials and container recipe. The target repository contains the code the agent changes. They can live in separate directories, and one workflow can coordinate several repositories.

## Initialize outside the target repository

Use an existing local Git checkout with at least one commit. `--repository` takes a filesystem path, not a Git remote URL; clone the repository first if needed.

```sh
npx @elie-laloum/outpost init --yes \
  --directory /work/workflow1 \
  --repository /work/backend \
  --install --build
```

Copy `/work/workflow1/.env.example` to `/work/workflow1/.env`, configure your [agent credentials](../../../agents/environment/), then run:

```sh
node /work/workflow1/run.ts "Implement the API change, test and commit"
```

The workflow directory does not need Git metadata. `init` writes its files there; the target repository is opened when the script runs. You can also initialize inside a repository by omitting `--repository`.

## Resolve paths explicitly

| Setting                         | Path resolution                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| `init --directory`              | Relative to the shell’s current directory; defaults to that directory.                       |
| `init --repository`             | Absolute or relative to the generated script’s directory; defaults to `.`.                   |
| Generated `.env` and `brief.md` | Relative to the script, even when launched from another directory.                           |
| Library `repository`            | Relative to `process.cwd()` unless you supply an absolute path; defaults to `process.cwd()`. |

For example, `--directory /work/workflow1 --repository ../backend` targets `/work/backend`. In a handwritten script, anchor the path to the script and pass it to `dispatch`:

```ts
import { resolve } from "node:path";
import {
  agent as composeAgent,
  claude,
  dispatch,
  reporter,
} from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const result = await dispatch({
  repository: resolve(import.meta.dirname, "../backend"),
  agent: composeAgent({ harness: claude.harness({}) }),
  sandboxProvider: dockerSandboxProvider({ image: "outpost:workflow1" }),
  branch: { mode: "named", name: "outpost/api-change" },
  brief: { text: "Implement the API change, test and commit." },
  observe: reporter(),
});
console.log(result.branch, result.commits);
```

This example assumes the image has been built and agent authentication configured. When adapting the generated starter, retain its `runtime` configuration and `.env` loading. Declaring a `repository` variable alone does not select the target: include it in the dispatch options. A supplied `workspace` already owns its repository; do not also pass `repository`.

## Locate changes and recovery files

Branch policies apply to the target repository:

- `named` keeps commits on the requested branch for review.
- `integrate`, used by the starter, merges into the target repository’s host branch after dispatch succeeds.
- `current` works directly in the selected checkout.

Managed worktrees, locks and logs use the target repository’s `.outpost`, not the workflow directory. Clean managed worktrees are removed on successful disposal; failed or cancelled dispatches preserve their worktree and attach recovery paths to the error. The starter displays agent progress and reports those paths on cancellation. See [branch policies](../../../environment/branches/) and [recovery](../../../operations/recovery/).

Each sandbox owns one repository. To change several repositories, create one `isolatedTask` per repository and connect them with `after`; see [multi-repository workflows](../../workflows/sandbox-tasks/#multiple-repositories). Outpost does not push commits automatically, and a later task failure does not roll back earlier repositories.
