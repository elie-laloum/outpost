---
title: "Your first task"
description: "Run an agent on your repository, read its answer, then let it commit a change on a separate branch."
---

## Write a review script

Start from the `outpost.config.mts` written in [Setup](../setup/). `dispatch()` runs one agent task in a fresh sandbox. The brief is its instruction; the named branch keeps its edits off your checkout.

```ts title="review.mts"
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/readme-review" },
  brief: {
    text: "Review the README for incorrect setup instructions. Report findings without editing files.",
  },
});
console.log(result.text);
console.log(result.usage);
console.log(result.commits);
```

## Run it and read the result

```sh
node review.mts
```

The script prints three fields when the agent finishes.

| Field     | What it holds                                                                   |
| --------- | ------------------------------------------------------------------------------- |
| `text`    | The agent’s answer: its README findings.                                        |
| `usage`   | Reported tokens, paid through the harness [authentication](../authentication/). |
| `commits` | New commits (`oid`, `subject`). Empty here: the brief asked for no edits.       |

## Ask for a change

Copy `review.mts` to `fix.mts` with a new branch and a brief that asks for a commit. Keep the original for [Run in CI](../ci-automation/).

```ts title="fix.mts"
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/readme-fix" },
  brief: {
    text: "Fix the README setup command, verify that it works and commit the correction.",
  },
});
console.log(result.text);
console.log(result.commits);
```

Run `node fix.mts`, then review the branch. It starts from your `HEAD` and stays after the run; use a new name for each task.

```sh
git log --oneline HEAD..outpost/readme-fix
git diff HEAD...outpost/readme-fix
```

:::note
`result.text` is the agent’s claim. Check the branch or run your tests before relying on it.
:::

## What just happened

Outpost opened a worktree under `.outpost/workspaces/`, ran the agent in a sandbox, then closed the sandbox and kept the branch. [How Outpost works](../how-it-works/) details the lifecycle.

## Next steps

<!-- path -->

1. [From a task to a workflow](../first-workflow/): Chain tasks with dependencies.
2. [Typed responses](../typed-responses/): Receive validated data instead of free text.
3. [Sandbox sessions](../sandbox-sessions/): Run your tests before you merge.
4. [Repository and branch](../repository-and-branch/): Work in your checkout or merge automatically.

API: [dispatch](../../reference/dispatch/) · [DispatchResult](../../reference/dispatchresult/).
