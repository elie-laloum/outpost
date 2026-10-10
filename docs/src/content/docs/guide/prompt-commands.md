---
title: "Include command output in a brief"
description: "Run trusted preparation commands when rendering a prompt."
---

Start from [briefs](../briefs/) and its configuration. Run trusted preparation commands when rendering a prompt.

## Insert command output

Write `` !`command` `` to replace the fragment with what the command prints. Use it to hand the agent a failing test log or recent history.

```md title="fix-test.md"
Fix the failing test in {{TEST_FILE}}. Its current output:

!`npx vitest run {{TEST_FILE}} 2>&1 | tail -n 40`

Recent commits:

!`git log --oneline -5`
```

The commands run in the sandbox, in the checkout the agent works on, with `sh -c`. Before each pass, all commands of the brief run in parallel.

<!-- features -->

- **Output**: Only stdout is inserted; add `2>&1` to include errors.
- **Failure**: A nonzero exit fails the task with code `prompt` and stops the other commands.
- **Deadline**: `expansionMs` bounds each command; the default is 30 seconds.

```ts
import { fileURLToPath } from "node:url";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  expansionMs: 60_000,
  brief: {
    file: fileURLToPath(new URL("fix-test.md", import.meta.url)),
    values: { TEST_FILE: "test/signup.test.ts" },
  },
});
```

:::caution
Commands execute code. Keep template files under your control, and pass only trusted `values` into a command: they are inserted without quoting.
:::

Values cannot add commands: Outpost finds the `` !` `` fragments in the file before it fills placeholders.
