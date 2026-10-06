---
title: "Write agent instructions"
description: "Give an agent a task using text or a Markdown template."
---

## Choose text or a file

The `brief` contains the instructions you send to the agent. Use `text` for a request written in your script, or `file` for instructions you want to keep and reuse in Markdown.

|                | Text brief `{ text }`          | File brief `{ file, values }`                          |
| -------------- | ------------------------------ | ------------------------------------------------------ |
| Source         | A string built by your code    | A Markdown file kept next to your scripts              |
| Variables      | None: interpolate in your code | `{{NAME}}` from `values`, `WORK_BRANCH`, `BASE_BRANCH` |
| Command output | None                           | `` !`command` `` replaced by its output                |
| Best for       | Generated or one-off requests  | Reusable tasks shared by several scripts               |

A text brief is sent as written. The rest of this page covers file briefs.

## Fill a template

Write placeholders as `{{NAME}}`, with letters, digits and underscores. Outpost reads the file and fills them before the agent starts.

```md title="task.md"
Add {{FEATURE}} to the signup form.

You work on {{WORK_BRANCH}}, created from {{BASE_BRANCH}}.
Run `npm test` and commit your change.
```

```ts title="feature.ts"
import { reportValue } from "./reporter.ts";
import { fileURLToPath } from "node:url";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/email-validation" },
  brief: {
    file: fileURLToPath(new URL("task.md", import.meta.url)),
    values: { FEATURE: "email validation" },
  },
});
reportValue(result.text);
// Example output: Added email validation to the signup form and committed it.
```

A relative `file` resolves from the process working directory. Build the path from `import.meta.url` so the script runs from anywhere.

| Placeholder       | Filled with                                                                             |
| ----------------- | --------------------------------------------------------------------------------------- |
| `{{FEATURE}}`     | `values.FEATURE`: a string, a finite number or a boolean.                               |
| `{{WORK_BRANCH}}` | The branch the agent works on (see [Repository and branch](../repository-and-branch/)). |
| `{{BASE_BRANCH}}` | The branch checked out in your repository when the task started.                        |

If a placeholder has no value, the task fails with code `prompt` before the agent starts. If you provide a value that the file does not use, Outpost reports it through `warn`.

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

## Instruct the agent, enforce in code

Instructions tell the agent what you want it to do. If a condition determines whether the work is accepted, check that condition in your workflow code.

| Condition            | Ask in the brief          | Enforce in code                                                                                                  |
| -------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Tests pass           | "Run `npm test`."         | Run them yourself in a [sandbox session](../sandbox-sessions/) or a [verification loop](../verification-loops/). |
| Answer format        | "Reply with a JSON list." | Validate a [typed response](../typed-responses/).                                                                |
| Files left untouched | "Do not edit `config/`."  | Inspect the diff, or deny writes with the built-in harness [permissions](../harness-permissions/).               |
| Human sign-off       | "Do not merge yet."       | Stop at an [approval](../approvals/) gate.                                                                       |

Providing a [typed response](../typed-responses/) automatically adds its final-answer format after the rendered brief; JSON contracts also include the input JSON Schema. You do not need to put its tags in the brief.

## Limits

- Text briefs do not accept `values` and never run commands.
- `WORK_BRANCH` and `BASE_BRANCH` are reserved: passing them in `values` is a configuration error.
- `BASE_BRANCH` is empty when your repository has a detached `HEAD`.
- A command cannot contain a backtick.
- With [host execution](../host-process/), commands run on your machine: `sh -c`, or PowerShell on Windows.
- A generated `{{WORK_BRANCH}}` and command output change between runs; see [Replay without a model](../record-replay/).

API: [Brief](../../reference/brief/) · [PromptVariables](../../reference/promptvariables/) · [DispatchOptions](../../reference/dispatchoptions/) · [dispatch](../../reference/dispatch/).
