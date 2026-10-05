---
title: "Your first task"
description: "Write a TypeScript script, run an agent and review its answer and commits."
---

## Create the script

Create `review.ts` next to the configuration from [Installation](../setup/). This first script asks the agent to read the README and report its findings. `dispatch()` opens a fresh sandbox, and the named branch gives the task its own checkout.

```ts title="review.ts"
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

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

## Run the script

The script prints the agent’s findings when the task finishes. This request asks for a review without edits, so there should be no new commits.

```sh
node review.ts
```

API reference: [DispatchResult](../../reference/dispatchresult/) and [Usage](../../reference/usage/).

## Ask for a change

To ask the agent to edit the repository, create `fix.ts` with another branch name and instructions to commit the correction. Keep `review.ts` if you want to reuse the read-only request in [CI](../ci-automation/).

```ts title="fix.ts"
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

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

Run `node fix.ts`, then inspect the commits and diff with the commands below. A new named branch starts from your `HEAD` and remains after the task. Use a fresh name for each independent task; an existing named branch is reused.

```sh
git log --oneline HEAD..outpost/readme-fix
git diff HEAD...outpost/readme-fix
```

:::note
The answer describes what the agent says it did. Review the diff and run the relevant checks before accepting the change.
:::

## Understand the run

Outpost opened a worktree under `.outpost/workspaces/`, ran the agent in a sandbox, then closed the sandbox and kept the branch. [How it works](../how-it-works/) details the lifecycle.

## Next steps

<!-- path -->

1. [From a task to a workflow](../first-workflow/): Chain tasks with dependencies.
2. [Typed responses](../typed-responses/): Receive validated data instead of free text.
3. [Sandbox sessions](../sandbox-sessions/): Run your tests before you merge.
4. [Repository and branch](../repository-and-branch/): Work in your checkout or merge automatically.

API: [dispatch](../../reference/dispatch/) · [DispatchResult](../../reference/dispatchresult/).
