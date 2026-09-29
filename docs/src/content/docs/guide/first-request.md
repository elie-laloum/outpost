---
title: "Your first task"
description: "Run an agent on your repository, read its answer, then let it commit a change on a separate branch."
---

Run an agent on your repository, read its answer, then let it commit a change on a separate branch. You need the `outpost.config.mts` file from [Setup](../setup/), which defines `coder`, `repository` and `sandboxProvider`.

## Write a review script

Create `review.mts` next to `outpost.config.mts`. `dispatch()` runs one agent task: it allocates a sandbox, runs the agent on your repository and closes the sandbox when the agent finishes.

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

The brief is the instruction you give the agent. The named branch gives the agent its own Git worktree, so your checkout stays untouched.

## Run it and read the result

```sh
node review.mts
```

The script prints three values once the agent finishes:

- `result.text` is the agent’s final answer: here, its list of README findings.
- `result.usage` holds the token counts the agent reported (`input`, `cached`, `output`). The run is paid through the [authentication](../authentication/) chosen on the harness: it counts against your subscription with `"account"` and is billed to your API key with `"usage"`.
- `result.commits` lists the commits the agent created, each with an `oid` and a `subject`. It should be empty here, because the brief asked for no edits.

## Ask for a change

Copy `review.mts` to `fix.mts`, then give it a new branch and a brief that asks for a verified commit. `review.mts` stays as it is: [Run in CI](../ci-automation/) reuses it.

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

Run `node fix.mts`. Outpost creates `outpost/readme-fix` from your current `HEAD` and keeps the branch after the run, so the change waits there for your review. Inspect it with plain Git from your checkout:

```sh
git log --oneline HEAD..outpost/readme-fix
git diff HEAD...outpost/readme-fix
```

The commits listed by `git log` match `result.commits`. Use a fresh branch name for each independent task.

## What just happened

Outpost prepared a worktree for the named branch under `.outpost/workspaces/` in your repository and allocated a sandbox from your provider. The agent ran in that worktree with the brief as its task. When it finished, Outpost collected the new commits, closed the sandbox and removed the clean worktree, keeping the branch. [How Outpost works](../how-it-works/) describes this lifecycle in detail.

`result.text` reports what the agent says it did. To act on facts rather than prose, check the outcome yourself with the tools below.

## Next steps

- [From a task to a workflow](../first-workflow/): chain several tasks with dependencies.
- [Typed responses](../typed-responses/): receive validated data instead of free text.
- [Sandbox sessions](../sandbox-sessions/): run your tests in the sandbox before you merge.
- [Repository and branch](../repository-and-branch/): work in the current checkout or merge the branch automatically.

API: [dispatch](../../reference/dispatch/) · [DispatchResult](../../reference/dispatchresult/).
