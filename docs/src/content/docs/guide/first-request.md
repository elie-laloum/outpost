---
title: "Your first task"
description: "Run a README review and inspect the answer and branch."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="create-the-script"></span>
<span id="run-the-script"></span>
<span id="ask-for-a-change"></span>
<span id="understand-the-run"></span>
<span id="next-steps"></span>

## Ask for a README review

Use the configuration from [Installation](../setup/). The target repository must have a committed README. Save `review.ts` beside `outpost.config.ts`; it asks the agent for findings on a separate branch.

```ts title="review.ts"
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/readme-review" },
  brief: {
    text: "Review the README setup instructions. Report problems or say none were found. Do not edit files.",
  },
});
console.log(result.text);
console.log(result.commits);
// Example output: []
```

## Run and inspect the result

Run the script from its directory:

```sh
node review.ts
```

When the task finishes, it prints the agent’s findings, or an answer saying no problem was found, followed by the list of commits. The request asks for no edits, so an empty commit list is expected. Model responses vary; the example output is not a fixed test result.

The instruction does not enforce read-only access. Inspect the actual branch if that matters to your review:

```sh
git -C /absolute/path/to/your-repository diff HEAD...outpost/readme-review
git -C /absolute/path/to/your-repository worktree list
```

The diff above compares commits. If `worktree list` still shows a directory for `outpost/readme-review`, inspect its files too:

```sh
git -C /path/from/worktree-list status --short --untracked-files=all
git -C /path/from/worktree-list diff HEAD
```

`status` reveals untracked files; the second diff shows staged and unstaged tracked changes. Read any untracked files before concluding that nothing changed.

Outpost closes the sandbox it opened and keeps the named branch. A new branch starts from the repository’s `HEAD`; an existing name reuses its earlier work. Choose a fresh name for an independent task. Dirty worktrees can remain for [inspection and recovery](../recovery/).

## Continue from this result

- [Ask for a change](../git-workspaces/): Keep edits on a branch for review.
- [Run an independent check](../sandbox-sessions/): Test the agent’s work in the same sandbox.
- [Connect two tasks](../first-workflow/): Pass the answer to your own code.
- [Follow live progress](../progress/): Display activity while the model works.

The answer, commits and usage are described by [DispatchResult](../../reference/dispatchresult/). [How Outpost runs a task](../how-it-works/) explains which resources remain after this call.
