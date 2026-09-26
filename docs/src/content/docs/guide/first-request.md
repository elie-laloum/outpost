---
title: "First request"
description: "Run a task and read the result."
---

`dispatch()` runs one agent task and closes the sandbox it allocated. Import the configuration from [Setup](../setup/), then pass a brief.

## Run a task

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
```

```sh
node review.mts
```

The answer is in `result.text`. `result.usage` contains token counts, and `result.commits` lists collected commits. An agent call uses the account or API billing selected on its harness.

## Allow changes

Replace `brief.text` with a concrete change request, for example: `Fix the README setup command, verify it and commit the correction.` The named branch keeps the change separate for review. Outpost collects commits; asking for a commit is still part of the agent’s task.

Use a fresh branch name for independent jobs. [Branch strategy](../branch-strategy/) explains how to work in the current checkout or integrate a completed branch.

## Use the result

`text` is the agent’s answer, not a test report enforced by Outpost. Use [validated output](../output-validation/) for data your application consumes, and execute checks in a [sandbox session](../sandbox-sessions/) when the outcome must gate integration.

A failed operation rejects. A workflow’s `start()` instead returns a result with a status: see [error handling](../error-handling/).

API: [dispatch](../../reference/dispatch/) · [DispatchResult](../../reference/dispatchresult/).
